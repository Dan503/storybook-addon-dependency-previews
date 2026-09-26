import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './BgImageContainerAtom.lit'
import type { BgImageContainerAtom } from './BgImageContainerAtom.lit'

const meta: Meta<BgImageContainerAtom> = {
	title: '01 Atoms / Bg Image Container Atom',
	component: 'app-bg-image-container-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-bg-image-container-atom
			.imgSrc=${args.imgSrc}
			.altText=${args.altText}
			.tintColor=${args.tintColor}
			.tintPercent=${args.tintPercent}
		>
			<p
				style="border: 2px dashed var(--globalColor_red500); padding: 1rem; font-size: 1.5rem; line-height: calc(2 / 1.5); font-weight: 700; color: black; margin: 0;"
			>
				Content inside BgImageContainer
			</p>
		</app-bg-image-container-atom>`,
}

export default meta

type Story = StoryObj<BgImageContainerAtom>

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: 'Placeholder Image',
	},
}
