import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { categoryList, exampleMealList } from 'example-site-shared/data'
import {
	CardListTemplate,
	type PropsForCardListTemplate,
} from './CardListTemplate'

// Pre-transform data to avoid serializing large objects into URL args
const categoryCardList = categoryList?.map((category) => ({
	id: category.idCategory,
	title: category.strCategory,
	imgSrc: category.strCategoryThumb,
	description: category.strCategoryDescription,
	href: '/categories/$category',
	hrefParams: { category: category.strCategory },
}))

const mealCardList = exampleMealList?.map((meal) => ({
	id: meal.id,
	title: meal.name,
	imgSrc: meal.image,
	description: meal.area,
	href: '/meal/$mealId',
	hrefParams: { mealId: meal.id },
}))

const meta: Meta<typeof CardListTemplate> = {
	title: '04 Templates / Card List Template',
	component: CardListTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'fullscreen',
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		cardList: {
			mapping: {
				categories: categoryCardList,
				meals: mealCardList,
			},
			control: {
				type: 'select',
			},
			options: ['categories', 'meals'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const CategoryList: Story = {
	args: {
		title: 'What type of meal are you looking for?',
		introText:
			'Browse through our diverse meal categories to find the perfect dish for any occasion.',
		cardList: 'categories' as unknown as PropsForCardListTemplate['cardList'],
	},
}

export const MealList: Story = {
	args: {
		title: 'Delicious chicken dishes',
		introText:
			'Explore our curated selection of mouth-watering chicken recipes that are sure to satisfy your cravings.',
		cardList: 'meals' as unknown as PropsForCardListTemplate['cardList'],
	},
}
