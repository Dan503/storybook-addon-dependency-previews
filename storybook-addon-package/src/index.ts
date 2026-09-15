import { definePreviewAddon } from 'storybook/internal/csf'
import { defaultPreviewParameters } from './panels/DefaultAutoDocsLayout'
import { decorators } from './preview'
import type { DependencyPreviewsAddonTypes } from './types'

// Re-export browser blocks so users can import directly
export * from './blocks/index'
export * from './panels/index'
export * from './types'
export * from './preview'

/**
 * Registers the addon in a CSF Next `preview.ts` (the default style from
 * Storybook 11 onwards):
 *
 * ```ts
 * import { definePreview } from '@storybook/react-vite'
 * import addonDocs from '@storybook/addon-docs'
 * import { dependencyPreviews } from 'storybook-addon-dependency-previews'
 *
 * export default definePreview({
 *   addons: [addonDocs(), dependencyPreviews()],
 *   parameters: {
 *     dependencyPreviews: { dependenciesJson, storyModules, sourceRootUrl, projectRootPath },
 *   },
 * })
 * ```
 *
 * `addonDocs()` has to be listed as well: in a CSF Next preview the `addons`
 * list here is what loads each addon's preview-side setup, and the docs pages
 * this addon renders into come from `@storybook/addon-docs`.
 *
 * Bundles the same `defaultPreviewParameters` and `dependencyPreviewDecorators`
 * that the hand-spread `preview.ts` form uses, so both forms behave identically.
 */
export function dependencyPreviews() {
	return definePreviewAddon<DependencyPreviewsAddonTypes>({
		parameters: defaultPreviewParameters,
		decorators,
	})
}

export default dependencyPreviews
