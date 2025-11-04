import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'
import { exampleIngredient, exampleMeal } from '../../../data/example-meal-data'

const meta: Meta<typeof CardMolecule> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
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
