import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import '../zz-meta-components/ChildContentAtom.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ContentRestraintAtom.lit'
import type { ContentRestraintAtom } from './ContentRestraintAtom.lit'

const meta: Meta<ContentRestraintAtom> = {
	title: '01 Atoms / Content Restraint Atom',
	component: 'app-content-restraint-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-content-restraint-atom .padVertical=${args.padVertical}>
			<app-child-content-atom></app-child-content-atom>
		</app-content-restraint-atom>`,
}

export default meta

type Story = StoryObj<ContentRestraintAtom>

export const Primary: Story = {}
