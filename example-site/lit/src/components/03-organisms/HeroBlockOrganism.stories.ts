import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './HeroBlockOrganism.lit'
import type { HeroBlockOrganism } from './HeroBlockOrganism.lit'

const meta: Meta<HeroBlockOrganism> = {
	title: '03 Organisms / Hero Block Organism',
	component: 'app-hero-block-organism',
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-hero-block-organism
			.imgSrc=${args.imgSrc}
			.altText=${args.altText}
			.tintColor=${args.tintColor}
			.tintPercent=${args.tintPercent}
		>
			<span slot="title">Hero Block Title</span>
			<p>This is where the hero block content goes.</p>
		</app-hero-block-organism>`,
}

export default meta

type Story = StoryObj<HeroBlockOrganism>

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: '',
	},
}
