import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './FooterOrganism.lit'
import type { FooterOrganism } from './FooterOrganism.lit'

const meta: Meta<FooterOrganism> = {
	title: '03 Organisms / Footer Organism',
	component: 'app-footer-organism',
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: () => html`<app-footer-organism></app-footer-organism>`,
}

export default meta

type Story = StoryObj<FooterOrganism>

export const Primary: Story = {}
