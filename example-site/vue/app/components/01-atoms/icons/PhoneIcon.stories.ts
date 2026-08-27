import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import PhoneIcon, { type PropsForPhoneIcon } from './PhoneIcon.vue'

const meta: Meta<typeof PhoneIcon> = {
	title: '01 Atoms / Icons / Phone Icon',
	component: PhoneIcon,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'centered',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForPhoneIcon,
}

export const WithAltTextAndColour: Story = {
	args: {
		altText: 'Phone number',
		className: 'text-green-500',
	} satisfies PropsForPhoneIcon,
}
