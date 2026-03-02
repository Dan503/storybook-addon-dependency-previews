import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { HeroBlockOrganismComponent } from './HeroBlockOrganism.component'

const meta: Meta<HeroBlockOrganismComponent> = {
	title: '03 Organisms / Hero Block Organism',
	component: HeroBlockOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<HeroBlockOrganismComponent>

export const Primary: Story = {
	args: {
		title: 'Welcome to The Meal Place',
		imgSrc: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
		tintPercent: 70,
		tintColor: 'white',
	},
	render: (args) => ({
		props: args,
		template: `<app-hero-block-organism [title]="title" [imgSrc]="imgSrc" [tintPercent]="tintPercent" [tintColor]="tintColor"><p>Example tagline content</p></app-hero-block-organism>`,
	}),
}
