import type { Meta } from '@storybook/react-vite'
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

export const Meal = {
	args: {
		title: exampleMeal.name,
		href: '/example-path',
		description: `${exampleMeal.area} ${exampleMeal.category} dish`,
		imgSrc: exampleMeal.image,
	} satisfies PropsForCardMolecule,
}

export const Ingredient = {
	args: {
		title: exampleIngredient.ingredient,
		href: '/example-path',
		description: exampleIngredient.amount,
		imgSrc: exampleIngredient.imageUrl.small,
	} satisfies PropsForCardMolecule,
}
