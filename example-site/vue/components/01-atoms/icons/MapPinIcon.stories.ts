import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import MapPinIcon, { type PropsForMapPinIcon } from './MapPinIcon.vue'

const meta: Meta<typeof MapPinIcon> = {
	title: '01 Atoms / Icons / Map Pin Icon',
	component: MapPinIcon,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'centered',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForMapPinIcon,
}

export const WithAltTextAndColour: Story = {
	args: {
		altText: 'Location',
		className: 'text-red-500',
	} satisfies PropsForMapPinIcon,
}
