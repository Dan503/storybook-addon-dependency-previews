import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import '../zz-meta-components/ChildContentAtom.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ScreenPaddingAtom.lit'
import type { ScreenPaddingAtom } from './ScreenPaddingAtom.lit'

const meta: Meta<ScreenPaddingAtom> = {
	title: '01 Atoms / Screen Padding Atom',
	component: 'app-screen-padding-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-screen-padding-atom .padVertical=${args.padVertical}>
			<app-child-content-atom></app-child-content-atom>
		</app-screen-padding-atom>`,
}

export default meta

type Story = StoryObj<ScreenPaddingAtom>

export const Primary: Story = {}

export const WithVerticalPadding: Story = {
	name: 'With Vertical Padding',
	args: { padVertical: true },
}
