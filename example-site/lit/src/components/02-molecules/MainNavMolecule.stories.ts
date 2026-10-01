import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './MainNavMolecule.lit'
import type { MainNavMolecule } from './MainNavMolecule.lit'

const meta: Meta<MainNavMolecule> = {
	title: '02 Molecules / Main Nav Molecule',
	component: 'app-main-nav-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: () => html`<app-main-nav-molecule></app-main-nav-molecule>`,
}

export default meta

type Story = StoryObj<MainNavMolecule>

export const Primary: Story = {}
