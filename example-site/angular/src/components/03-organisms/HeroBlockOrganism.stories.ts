import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { HeroBlockOrganismComponent } from './HeroBlockOrganism.component';

const meta: Meta<HeroBlockOrganismComponent> = {
	title: '03 Organisms / Hero Block Organism',
	component: HeroBlockOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<HeroBlockOrganismComponent>;

export const StringTitle: Story = {
	args: {
		title: 'Hero Block Title as String',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
	},
	render: (args) => ({
		template: `
			<hero-block-organism
				[title]="title"
				[imgSrc]="imgSrc"
			>
				<p class="text-center text-lg mt-4">This is where the hero block content goes.</p>
			</hero-block-organism>
		`,
		props: args,
	}),
};

export const TemplateTitle: Story = {
	args: {
		title: 'Hero Block Title as String',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
	},
	render: (args) => ({
		template: `
			<ng-template #titleTemplate>
				<span class="text-red-800">Hero Block Title as Template</span>
			</ng-template>
			<hero-block-organism
				[title]="titleTemplate"
				[imgSrc]="imgSrc"
			>
				<p class="text-center text-lg mt-4">This is where the hero block content goes.</p>
			</hero-block-organism>
		`,
		props: args,
	}),
};
