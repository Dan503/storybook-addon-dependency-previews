import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { CompactListingMoleculeComponent } from './CompactListingMolecule.component';
import { exampleIngredient } from 'example-site-shared/data';

const meta: Meta<CompactListingMoleculeComponent> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: CompactListingMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<CompactListingMoleculeComponent>;

export const Primary: Story = {
	args: {
		title: 'Title of the listing',
		description: `Listing description`,
		imageSrc: exampleIngredient.imageUrl.small,
	},
};

/** A changing address, so the story also shows its piece being filled in. */
export const WithLink: Story = {
	args: {
		title: 'Title of the listing',
		description: `Listing description`,
		imageSrc: exampleIngredient.imageUrl.small,
		href: '/categories/$category',
		hrefParams: { category: 'Beef' },
	},
};
