import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Framework, PreviewFile } from '../detect.js'

export type PreviewPatchResult =
	| { kind: 'created'; path: string }
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; path: string }
	| { kind: 'failed'; reason: string }

type SupportedFramework = 'react-vite' | 'sveltekit' | 'svelte-vite'

const STORY_GLOBS: Record<SupportedFramework, string> = {
	'react-vite': '/src/**/*.stories.@(tsx|ts|jsx|js)',
	sveltekit: '/src/**/*.stories.@(ts|js|svelte)',
	'svelte-vite': '/src/**/*.stories.@(ts|js|svelte)',
}

function dependencyPreviewsBlock(
	framework: SupportedFramework,
	sourceRootUrl: string,
	indent: string = '\t',
): string {
	const l2 = indent.repeat(2)
	const l3 = indent.repeat(3)
	const l4 = indent.repeat(4)
	const lines = [
		`${l2}dependencyPreviews: {`,
		`${l3}dependenciesJson,`,
		`${l3}projectRootPath: new URL('..', import.meta.url).pathname,`,
		`${l3}storyModules: import.meta.glob(`,
		`${l4}'${STORY_GLOBS[framework]}',`,
		`${l4}{ eager: false },`,
		`${l3}),`,
	]
	if (sourceRootUrl) {
		lines.push(`${l3}sourceRootUrl: '${sourceRootUrl.replace(/'/g, "\\'")}',`)
	}
	lines.push(`${l2}},`)
	return lines.join('\n')
}

function detectFileIndent(content: string): string {
	const m = content.match(/^([ \t]+)\S/m)
	return m ? m[1]! : '\t'
}

function reactTemplate(sourceRootUrl: string): string {
	return `/// <reference types="vite/client" />

import {
\tdefaultPreviewParameters,
\tdependencyPreviewDecorators,
\ttype StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

const previewConfig: StorybookPreviewConfig = {
\tparameters: {
\t\t...defaultPreviewParameters,
${dependencyPreviewsBlock('react-vite', sourceRootUrl)}
\t},
\tdecorators: [...dependencyPreviewDecorators],
}

export default previewConfig
`
}

function svelteTemplate(
	framework: 'sveltekit' | 'svelte-vite',
	sourceRootUrl: string,
): string {
	return `/// <reference types="vite/client" />

import {
\tdefaultPreviewParameters,
\tdependencyPreviewDecorators,
\ttype StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

const previewConfig: StorybookPreviewConfig = {
\tparameters: {
\t\t...defaultPreviewParameters,
${dependencyPreviewsBlock(framework, sourceRootUrl)}
\t},
\tdecorators: [...dependencyPreviewDecorators],
}

export default previewConfig
`
}

function templateForFramework(
	framework: SupportedFramework,
	sourceRootUrl: string,
): { content: string; lang: PreviewFile['lang'] } {
	if (framework === 'react-vite') {
		return { content: reactTemplate(sourceRootUrl), lang: 'ts' }
	}
	return { content: svelteTemplate(framework, sourceRootUrl), lang: 'ts' }
}

const IMPORT_BLOCK = (withType: boolean) =>
	`import {
\tdefaultPreviewParameters,
\tdependencyPreviewDecorators,${withType ? `\n\ttype StorybookPreviewConfig,` : ''}
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'
`

function findImportInsertionIndex(content: string): number {
	const lines = content.split('\n')
	let idx = 0
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!
		if (
			line.startsWith('///') ||
			line.startsWith("'use client'") ||
			line.startsWith('"use client"') ||
			line.trim() === ''
		) {
			idx += line.length + 1
			continue
		}
		break
	}
	return idx
}

function patchExistingPreview(
	previewFile: PreviewFile,
	framework: SupportedFramework,
	sourceRootUrl: string,
): PreviewPatchResult {
	let content: string
	try {
		content = readFileSync(previewFile.path, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not read ${previewFile.path}: ${(e as Error).message}`,
		}
	}

	if (/['"]storybook-addon-dependency-previews['"]/.test(content)) {
		return { kind: 'skipped', reason: 'addon already configured in preview' }
	}

	if (/\bmodule\.exports\s*=/.test(content)) {
		return {
			kind: 'failed',
			reason:
				'Preview file uses CommonJS (module.exports). The wizard only patches ESM preview files — please convert to ESM or follow the manual setup docs.',
		}
	}

	const isTs = previewFile.lang === 'ts' || previewFile.lang === 'tsx'
	const indent = detectFileIndent(content)
	const l1 = indent
	const l2 = indent.repeat(2)

	const importInsertAt = findImportInsertionIndex(content)
	let newContent =
		content.slice(0, importInsertAt) +
		IMPORT_BLOCK(isTs) +
		'\n' +
		content.slice(importInsertAt)

	const block = dependencyPreviewsBlock(framework, sourceRootUrl, indent)

	const paramsMatch = newContent.match(/(parameters\s*:\s*\{)/)
	if (paramsMatch && paramsMatch.index !== undefined) {
		const insertAt = paramsMatch.index + paramsMatch[0].length
		const insertion = `\n${l2}...defaultPreviewParameters,\n${block}`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else {
		const objectOpener = newContent.match(
			/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
		)
		if (!objectOpener || objectOpener.index === undefined) {
			return {
				kind: 'failed',
				reason:
					'Could not locate the preview config object — please add the dependencyPreviews parameters manually.',
			}
		}
		const insertAt = objectOpener.index + objectOpener[0].length
		const insertion = `\n${l1}parameters: {\n${l2}...defaultPreviewParameters,\n${block}\n${l1}},`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	}

	const decoratorsMatch = newContent.match(/(decorators\s*:\s*\[)/)
	if (decoratorsMatch && decoratorsMatch.index !== undefined) {
		const insertAt = decoratorsMatch.index + decoratorsMatch[0].length
		const insertion = `\n${l2}...dependencyPreviewDecorators,`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else {
		const objectOpener = newContent.match(
			/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
		)
		if (objectOpener && objectOpener.index !== undefined) {
			const insertAt = objectOpener.index + objectOpener[0].length
			const insertion = `\n${l1}decorators: [...dependencyPreviewDecorators],`
			newContent =
				newContent.slice(0, insertAt) +
				insertion +
				newContent.slice(insertAt)
		}
	}

	writeFileSync(previewFile.path, newContent, 'utf8')
	return { kind: 'patched', path: previewFile.path }
}

export function patchPreviewFile(opts: {
	storybookDir: string
	previewFile: PreviewFile | null
	framework: Framework
	sourceRootUrl: string
}): PreviewPatchResult {
	const { storybookDir, previewFile, framework, sourceRootUrl } = opts

	if (
		framework !== 'react-vite' &&
		framework !== 'sveltekit' &&
		framework !== 'svelte-vite'
	) {
		return {
			kind: 'failed',
			reason: `Preview patcher does not support framework "${framework}".`,
		}
	}

	if (previewFile) {
		return patchExistingPreview(previewFile, framework, sourceRootUrl)
	}

	const { content, lang } = templateForFramework(framework, sourceRootUrl)
	const path = resolve(storybookDir, `preview.${lang}`)
	if (existsSync(path)) {
		return { kind: 'skipped', reason: `${path} already exists` }
	}
	writeFileSync(path, content, 'utf8')
	return { kind: 'created', path }
}
