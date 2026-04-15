import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { CardMoleculeComponent } from './CardMolecule.component';
import { exampleMeal } from 'example-site-shared/data';

const meta: Meta<CardMoleculeComponent> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<CardMoleculeComponent>;

export const Primary: Story = {
	args: {
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image,
	},
	render: (args) => ({
		props: args,
		template: `
		<div class="mx-auto border border-dashed border-gray-500 p-4 w-60">
			<card-molecule [title]="title" [href]="href" [description]="description" [imgSrc]="imgSrc" />
		</div>
		`,
	}),
};

export const FullWidth: Story = {
	args: {
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image,
	},
	render: (args) => ({
		props: args,
	}),
};
