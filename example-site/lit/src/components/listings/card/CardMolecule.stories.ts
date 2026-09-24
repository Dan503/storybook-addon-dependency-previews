import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { exampleMeal } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './CardMolecule.lit'
import type { CardMolecule } from './CardMolecule.lit'

const meta: Meta<CardMolecule> = {
	title: 'Listings / Card / Card Molecule',
	component: 'app-card-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	args: {
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image,
	},
	render: (args) =>
		html`<app-card-molecule
			.title=${args.title}
			.imgSrc=${args.imgSrc}
			.description=${args.description}
			.href=${args.href}
			.hrefParams=${args.hrefParams}
		></app-card-molecule>`,
}

export default meta

type Story = StoryObj<CardMolecule>

export const Primary: Story = {
	decorators: [
		(story) =>
			html`<div
				style="box-sizing: border-box; width: 400px; margin: 0 auto; border: 1px dashed var(--globalColor_gray500); padding: 1rem;"
			>
				${story()}
			</div>`,
	],
}

export const FullWidth: Story = {
	name: 'Full width',
}
