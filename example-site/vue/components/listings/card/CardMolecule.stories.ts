import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMeal } from 'example-site-shared/data'
import CardMolecule, { type PropsForCardMolecule } from './CardMolecule.vue'

const meta: Meta<typeof CardMolecule> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

const cardArgs = {
	title: 'Title of the card',
	href: '/',
	description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
	imgSrc: exampleMeal.image,
} satisfies PropsForCardMolecule

export const Primary: Story = {
	args: cardArgs,
	render: (args) => ({
		components: { CardMolecule },
		setup() {
			return { args }
		},
		template: `
<div style="width: 400px" class="mx-auto border border-dashed border-gray-500 p-4">
	<CardMolecule v-bind="args" />
</div>`,
	}),
}

export const FullWidth: Story = {
	args: cardArgs,
	render: (args) => ({
		components: { CardMolecule },
		setup() {
			return { args }
		},
		template: `<CardMolecule v-bind="args" />`,
	}),
}
