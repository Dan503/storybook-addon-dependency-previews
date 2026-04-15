import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { CompactListingOrganismComponent } from './CompactListingOrganism.component';
import { type PropsForCompactListingMolecule } from './CompactListingMolecule.component';
import { ingredientItems } from 'example-site-shared/data';

const meta: Meta<CompactListingOrganismComponent> = {
	title: 'Listings / Compact / Compact Listing Organism',
	component: CompactListingOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		items: {
			mapping: {
				ingredients: ingredientItems,
			},
			control: {
				type: 'select',
			},
			options: ['ingredients'],
		},
	},
};

export default meta;

type Story = StoryObj<CompactListingOrganismComponent>;

export const Primary: Story = {
	args: {
		items: 'ingredients' as unknown as Array<Partial<PropsForCompactListingMolecule>>,
	},
	render: (args) => ({
		props: args,
		template: `<compact-listing-organism [items]="items" />`,
	}),
};
