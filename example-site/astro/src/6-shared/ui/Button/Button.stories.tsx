import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Button, type PropsForButton } from './Button'

const meta: Meta<typeof Button> = {
	component: Button,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		children: 'Click me',
		onClick: fn(),
	} satisfies PropsForButton,
}

export const Submit: Story = {
	args: {
		children: 'Send',
		type: 'submit',
	} satisfies PropsForButton,
}
