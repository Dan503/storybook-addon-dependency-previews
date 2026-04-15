import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { mealCards } from 'example-site-shared/data';
import { CardListingOrganismComponent } from './CardListingOrganism.component';
import { type PropsForCardMolecule } from './CardMolecule.component';

const meta: Meta<CardListingOrganismComponent> = {
	title: 'Listings / Card / Card Listing Organism',
	component: CardListingOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		cards: {
			mapping: {
				meals: mealCards,
			},
			control: { type: 'select' },
			options: ['meals'],
		},
	},
};

export default meta;

type Story = StoryObj<CardListingOrganismComponent>;

export const GridView: Story = {
	args: {
		cards: 'meals' as unknown as Array<Partial<PropsForCardMolecule>>,
	},
	render: (args) => ({
		props: args,
		template: `<card-listing-organism [cards]="cards" />`,
	}),
};

export const ListView: Story = {
	args: {
		cards: 'meals' as unknown as Array<Partial<PropsForCardMolecule>>,
		view: 'list',
	},
	render: (args) => ({
		props: args,
		template: `<card-listing-organism [cards]="cards" [view]="view" />`,
	}),
};
