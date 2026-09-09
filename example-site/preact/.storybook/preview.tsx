/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'

import { LocationProvider } from 'preact-iso'

import dependenciesJson from './dependency-previews.json'

import '../src/app.css'

import type { JSX } from 'preact'
import type { Preview } from '@storybook/preact-vite'

/**
 * Stops a link clicked inside a story from going anywhere.
 *
 * preact-iso listens for clicks on the window, and for any link to this same
 * address it blocks the browser's own navigation and rewrites the address
 * instead. Inside a story that address is the story's own, so following a link
 * would replace it with the link's — the story keeps drawing, but reloading
 * the canvas or opening it in its own tab would no longer land on that story.
 *
 * The Solid site avoids this by giving its stories a router that keeps its
 * address in memory and goes nowhere. preact-iso has no such mode, so the
 * click is stopped here before it reaches the window instead.
 *
 * Links to other sites are left alone: they carry `target="_blank"`, and
 * preact-iso ignores them too, so they open the way they should.
 */
function stopLinksLeavingTheStory(
	event: JSX.TargetedMouseEvent<HTMLDivElement>,
) {
	const clickedLink = (event.target as HTMLElement | null)?.closest('a')
	if (!clickedLink) return
	const isInsideThisSite = clickedLink.origin === location.origin
	if (!isInsideThisSite) return
	event.preventDefault()
	event.stopPropagation()
}

const preview: Preview = {
	decorators: [
		...dependencyPreviewDecorators,
		// The nav asks the router which page is on screen so it can mark the
		// current one, and there is no router in a story without this. Not
		// needed by the addon itself.
		(Story) => (
			<LocationProvider>
				<div onClick={stopLinksLeavingTheStory}>
					<Story />
				</div>
			</LocationProvider>
		),
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
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/preact',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview
