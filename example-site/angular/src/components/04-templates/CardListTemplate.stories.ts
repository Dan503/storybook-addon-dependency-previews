import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { categoryCardList, mealCardList } from 'example-site-shared/data'
import { CardListTemplateComponent } from './CardListTemplate.component'

const meta: Meta<CardListTemplateComponent> = {
	title: '04 Templates / Card List Template',
	component: CardListTemplateComponent,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<CardListTemplateComponent>

export const CategoryList: Story = {
	args: {
		title: 'Food categories',
		cardList: categoryCardList,
	},
}

export const MealList: Story = {
	args: {
		title: 'Beef meals',
		cardList: mealCardList,
	},
}
