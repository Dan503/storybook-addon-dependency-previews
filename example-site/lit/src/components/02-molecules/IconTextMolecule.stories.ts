import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import '../01-atoms/icons/MapPinIcon.lit'
import '../01-atoms/icons/PhoneIcon.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './IconTextMolecule.lit'
import type { IconTextMolecule } from './IconTextMolecule.lit'

const meta: Meta<IconTextMolecule> = {
	title: '02 Molecules / Icon Text Molecule',
	component: 'app-icon-text-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<IconTextMolecule>

export const MapPin: Story = {
	name: 'Map Pin',
	render: () =>
		html`<app-icon-text-molecule>
			<app-map-pin-icon slot="icon"></app-map-pin-icon>
			123 Main St, Anytown, Australia
		</app-icon-text-molecule>`,
}

export const Phone: Story = {
	render: () =>
		html`<app-icon-text-molecule>
			<app-phone-icon slot="icon"></app-phone-icon>
			0412 345 678
		</app-icon-text-molecule>`,
}
