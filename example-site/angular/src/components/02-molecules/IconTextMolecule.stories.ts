import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { IconTextMoleculeComponent } from './IconTextMolecule.component'
import { MapPinIconComponent } from '../01-atoms/icons/MapPinIcon.component'
import { PhoneIconComponent } from '../01-atoms/icons/PhoneIcon.component'

const meta: Meta<IconTextMoleculeComponent> = {
	title: '02 Molecules / Icon Text Molecule',
	component: IconTextMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<IconTextMoleculeComponent>

export const MapPin: Story = {
	args: {
		icon: MapPinIconComponent,
		text: '123 Main St, Anytown, Australia',
	},
}

export const Phone: Story = {
	args: {
		icon: PhoneIconComponent,
		text: '0412 345 678',
	},
}
