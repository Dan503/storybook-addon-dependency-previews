import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { mealCards } from 'example-site-shared/data'
import CardListingOrganism, {
	type PropsForCardListingOrganism,
} from './CardListingOrganism.vue'

const meta: Meta<typeof CardListingOrganism> = {
	title: 'Listings / Card / Card Listing Organism',
	component: CardListingOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		cards: {
			mapping: {
				meals: mealCards,
			},
			control: {
				type: 'select',
			},
			options: ['meals'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		cards: 'meals' as unknown as PropsForCardListingOrganism['cards'],
	},
	render: (args) => ({
		components: { CardListingOrganism },
		setup() {
			return { args }
		},
		template: `<CardListingOrganism v-bind="args" />`,
	}),
}
