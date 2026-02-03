// This runs in the Storybook preview (the iframe)
import '@iframe-resizer/child'
import type { PartialStoryFn } from 'storybook/internal/csf'

export const decorators = [
	(Story: PartialStoryFn) => {
		// Use queueMicrotask to run after the story renders
		queueMicrotask(() => {
			// Find the story root element and set the attribute on its parent
			const storyRoot = document.getElementById('storybook-root')
			if (storyRoot) {
				storyRoot.setAttribute('data-iframe-size', 'true')
			}
		})

		return Story()
	},
]

export const dependencyPreviewDecorators = decorators
