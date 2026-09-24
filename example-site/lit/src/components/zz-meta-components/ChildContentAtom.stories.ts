import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ChildContentAtom.lit'
import type { ChildContentAtom } from './ChildContentAtom.lit'

const meta: Meta<ChildContentAtom> = {
	title: 'ZZ Meta Components / Child Content Atom',
	component: 'app-child-content-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: () => html`<app-child-content-atom></app-child-content-atom>`,
}

export default meta

type Story = StoryObj<ChildContentAtom>

export const Primary: Story = {}
