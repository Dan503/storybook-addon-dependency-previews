/// <reference types="vite/client" />

import { setCustomElementsManifest } from '@storybook/web-components-vite'
import { html } from 'lit'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'
// Written by `pnpm sb:docs` from the doc comments on each component, so a docs
// page can list a component's properties and slots rather than only what its
// story happens to pass.
import customElements from '../custom-elements.json'

import '../src/app.css'

setCustomElementsManifest(customElements)

/**
 * Stops a link clicked inside a story from going anywhere.
 *
 * In the site the router catches a click on a link inside it and draws the new
 * page without reloading. A story has no router, so the browser follows the
 * link itself and loads the site's address in the story's place — which
 * Storybook does not have, so the story is replaced by "Not Found".
 *
 * The tests below mirror the router's own, so that exactly the clicks it would
 * have claimed are the ones stopped. Everything it ignores is left to the
 * browser and still behaves normally: a click with ctrl, cmd or shift held,
 * one with any button but the main one, a link to another site or an email
 * address, a link aimed at another tab or window, and a download.
 *
 * The link is found through the click's full path rather than by walking up
 * from where the click landed, because the links sit inside the components'
 * shadow roots, which walking up from the outside cannot see into.
 */
function stopLinksLeavingTheStory(event: MouseEvent) {
	const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey
	const isMainButton = event.button === 0
	if (event.defaultPrevented || isModifiedClick || !isMainButton) return

	const clickedLink = event
		.composedPath()
		.find(
			(node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement,
		)
	if (!clickedLink) return

	const opensElsewhere =
		clickedLink.target !== '' ||
		clickedLink.hasAttribute('download') ||
		clickedLink.getAttribute('rel') === 'external'
	const isEmailOrEmpty =
		clickedLink.href === '' || clickedLink.href.startsWith('mailto:')
	const isInsideThisSite = clickedLink.origin === location.origin
	if (opensElsewhere || isEmailOrEmpty || !isInsideThisSite) return

	event.preventDefault()
}

const previewConfig: StorybookPreviewConfig = {
	decorators: [
		...dependencyPreviewDecorators,
		// `display: contents` keeps the wrapper out of the layout, so the
		// full-height chain from the page down to the template is not broken.
		(story) =>
			html`<div style="display: contents" @click=${stopLinksLeavingTheStory}>
				${story()}
			</div>`,
	],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: new URL('..', import.meta.url).pathname,
			storyModules: import.meta.glob(
				'/src/**/*.{story,stories}.{tsx,ts,jsx,js,svelte}',
				{ eager: false },
			),
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/lit',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default previewConfig
