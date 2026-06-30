import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { categoryCardList, mealCardList } from 'example-site-shared/data'
import CardListTemplate, {
	type PropsForCardListTemplate,
} from './CardListTemplate.vue'

const meta: Meta<typeof CardListTemplate> = {
	title: '04 Templates / Card List Template',
	component: CardListTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
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
	render: (args) => ({
		components: { CardListTemplate },
		setup() {
			return { args }
		},
		template: `<CardListTemplate v-bind="args" />`,
	}),
}

export const MealList: Story = {
	args: {
		title: 'Delicious chicken dishes',
		introText:
			'Explore our curated selection of mouth-watering chicken recipes that are sure to satisfy your cravings.',
		cardList: 'meals' as unknown as PropsForCardListTemplate['cardList'],
	},
	render: (args) => ({
		components: { CardListTemplate },
		setup() {
			return { args }
		},
		template: `<CardListTemplate v-bind="args" />`,
	}),
}
