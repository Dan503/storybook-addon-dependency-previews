// This runs in the Storybook preview (the iframe)
import '@iframe-resizer/child'
import { useEffect, useRef } from 'react'
import type { PartialStoryFn } from 'storybook/internal/csf'

export const decorators = [
	(Story: PartialStoryFn) => {
		const ref = useRef<HTMLDivElement>(null)

		useEffect(() => {
			ref.current?.parentElement?.setAttribute('data-iframe-size', 'true')
		}, [])

		return (
			<div className="iframe-size-child" ref={ref}>
				<Story />
			</div>
		)
	},
]

export const dependencyPreviewDecorators = decorators
