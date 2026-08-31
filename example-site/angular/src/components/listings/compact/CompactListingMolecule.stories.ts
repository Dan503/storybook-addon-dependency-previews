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

/** No address, so the row draws as plain content rather than as a link. */
export const Primary: Story = {
	args: {
		title: 'Title of the listing',
		description: `Listing description`,
		imageSrc: exampleIngredient.imageUrl.small,
	},
};

/**
 * Given an address, the whole row becomes a link. The address used here is one
 * with a changing piece, so the row also shows that piece being filled in.
 */
export const WithLink: Story = {
	args: {
		title: 'Title of the listing',
		description: `Listing description`,
		imageSrc: exampleIngredient.imageUrl.small,
		href: '/categories/:category',
		hrefParams: { category: 'Beef' },
	},
};
