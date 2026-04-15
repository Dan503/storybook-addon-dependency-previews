import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { CardListTemplateComponent } from './CardListTemplate.component';
import { withSiteProviders } from '../../app/siteProviders';
import { mealCardList } from 'example-site-shared/data';

const meta: Meta<CardListTemplateComponent> = {
	title: '04 Templates / Card List Template',
	component: CardListTemplateComponent,
	tags: ['autodocs', 'template'],
	decorators: [...withSiteProviders],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<CardListTemplateComponent>;

export const GridView: Story = {
	args: {
		title: 'Chicken Meals',
		introText:
			'Discover our delicious chicken meals, crafted with fresh ingredients and bursting with flavor. Perfect for any occasion, our chicken dishes are sure to satisfy your cravings.',
		cardList: mealCardList,
	},
};

export const ListView: Story = {
	args: {
		title: 'Chicken Meals',
		introText:
			'Discover our delicious chicken meals, crafted with fresh ingredients and bursting with flavor. Perfect for any occasion, our chicken dishes are sure to satisfy your cravings.',
		cardList: mealCardList,
		view: 'list',
	},
};
