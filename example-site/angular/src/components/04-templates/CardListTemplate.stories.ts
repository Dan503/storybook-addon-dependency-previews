import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { CardListTemplateComponent } from './CardListTemplate.component';
import { withSiteProviders } from '../../app/siteProviders';
import { mealCardList } from 'example-site-shared/data';
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.component';

// The shared card data writes its address inside a `.map`, where TypeScript widens
// it to plain text, so the narrower prop no longer accepts it as it stands. The
// card listing story restates its type the same way for the same data.
const mealCards = mealCardList as Array<PropsForCardMolecule>;

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
		cardList: mealCards,
	},
};

export const ListView: Story = {
	args: {
		title: 'Chicken Meals',
		introText:
			'Discover our delicious chicken meals, crafted with fresh ingredients and bursting with flavor. Perfect for any occasion, our chicken dishes are sure to satisfy your cravings.',
		cardList: mealCards,
		view: 'list',
	},
};
