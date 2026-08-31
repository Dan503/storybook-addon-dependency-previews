import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { mealCards } from 'example-site-shared/data';
import { CardListingOrganismComponent } from './CardListingOrganism.component';
import { type PropsForCardMolecule } from './CardMolecule.component';

// The shared example cards are written in the dollar spelling, which this site
// does not use. Handing them over as they are would not fail: the colon filler
// finds no `:name` to replace and returns the template with its `$mealId` still
// in it, so every card would link to the same unfilled address. Naming the route
// again in this site's own spelling is what fills them in, and typing the result
// keeps every other field checked against the card's props.
const mealCardsForThisSite: Array<PropsForCardMolecule> = mealCards.map((card) => ({
	...card,
	href: '/meal/:mealId',
}));

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
				meals: mealCardsForThisSite,
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
		cards: 'meals' as unknown as Array<PropsForCardMolecule>,
	},
	render: (args) => ({
		props: args,
		template: `<card-listing-organism [cards]="cards" />`,
	}),
};

export const ListView: Story = {
	args: {
		cards: 'meals' as unknown as Array<PropsForCardMolecule>,
		view: 'list',
	},
	render: (args) => ({
		props: args,
		template: `<card-listing-organism [cards]="cards" [view]="view" />`,
	}),
};
