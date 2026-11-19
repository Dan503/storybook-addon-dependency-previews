import type { Meta, StoryObj } from '@storybook/react'
import { ContactForm } from './ContactForm'

const meta: Meta<typeof ContactForm> = {
	component: ContactForm,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
