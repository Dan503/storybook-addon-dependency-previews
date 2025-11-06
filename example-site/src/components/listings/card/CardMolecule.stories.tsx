import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleIngredient, exampleMeal } from '../../../data/example-meal-data'
import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'

const meta: Meta<typeof CardMolecule> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Meal: Story = {
	args: {
		title: exampleMeal.name,
		href: '/example-path',
		description: `${exampleMeal.area} ${exampleMeal.category} dish`,
		imgSrc: exampleMeal.image,
	} satisfies PropsForCardMolecule,
}

export const Ingredient: Story = {
	args: {
		title: exampleIngredient.ingredient,
		href: '/example-path',
		description: exampleIngredient.amount,
		imgSrc: exampleIngredient.imageUrl.small,
	} satisfies PropsForCardMolecule,
}
