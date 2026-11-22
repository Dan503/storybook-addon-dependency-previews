import type { Meta } from '../storybook.types'
import ChildContent from './ChildContent.astro'

export default {
	component: ChildContent,
	parameters: {
		docs: {
			description: {
				// Set here because ChildContent.astro has no frontmatter to hold a comment
				component:
					'Stand-in content for stories that need something to put inside a component. Only used in Storybook.',
			},
		},
	},
} satisfies Meta<typeof ChildContent>

export const Default = {}
