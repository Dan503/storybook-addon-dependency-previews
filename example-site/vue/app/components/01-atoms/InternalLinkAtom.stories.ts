import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMeal } from 'example-site-shared/data'
import InternalLinkAtom, {
	type PropsForInternalLinkAtom,
} from './InternalLinkAtom.vue'

const meta: Meta<typeof InternalLinkAtom> = {
	title: '01 Atoms / Internal Link Atom',
	component: InternalLinkAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		href: '/categories',
		// Both pieces, so every address the `href` control offers draws a link. A
		// changing piece with no value throws, so without these, picking
		// `/meal/[mealId]` or `/categories/[category]` from the control would fail
		// to render. The three addresses with nothing to fill ignore them. The card
		// molecule's story carries the same pair for the same reason.
		hrefParams: { mealId: exampleMeal.id, category: exampleMeal.category },
	} satisfies PropsForInternalLinkAtom,
	render: (args) => ({
		components: { InternalLinkAtom },
		setup() {
			return { args }
		},
		template: `<InternalLinkAtom v-bind="args">Food categories</InternalLinkAtom>`,
	}),
}
