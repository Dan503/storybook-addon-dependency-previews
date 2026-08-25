import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleIngredient } from 'example-site-shared/data'
import CompactListingMolecule, {
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule.vue'

const meta: Meta<typeof CompactListingMolecule> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: CompactListingMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount,
	} satisfies PropsForCompactListingMolecule,
	render: (args) => ({
		components: { CompactListingMolecule },
		setup() {
			return { args }
		},
		template: `<CompactListingMolecule v-bind="args" />`,
	}),
}
