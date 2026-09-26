import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import {
	categoryCardListForSite,
	mealCardListForSite,
} from '../../lib/storyExampleCards'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './CardListTemplate.lit'
import type { CardListTemplate } from './CardListTemplate.lit'

const meta: Meta<CardListTemplate> = {
	title: '04 Templates / Card List Template',
	component: 'app-card-list-template',
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		cardList: {
			mapping: {
				categories: categoryCardListForSite,
				meals: mealCardListForSite,
			},
			control: {
				type: 'select',
			},
			options: ['categories', 'meals'],
		},
	},
	render: (args) =>
		html`<app-card-list-template
			.pageTitle=${args.pageTitle}
			.introText=${args.introText}
			.cardList=${args.cardList}
		></app-card-list-template>`,
}

export default meta

type Story = StoryObj<CardListTemplate>

export const CategoryList: Story = {
	name: 'Category list',
	args: { cardList: 'categories' as any },
}

export const MealList: Story = {
	name: 'Meal list',
	args: { cardList: 'meals' as any },
}
