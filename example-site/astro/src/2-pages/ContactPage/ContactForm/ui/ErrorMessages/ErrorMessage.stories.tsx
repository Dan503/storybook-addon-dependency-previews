import type { Meta, StoryObj } from '@storybook/react'
import { ErrorMessage, type PropsForErrorMessage } from './ErrorMessage'

const meta: Meta<typeof ErrorMessage> = {
	component: ErrorMessage,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const ErrorString: Story = {
	args: {
		error: 'This is error text',
	} satisfies PropsForErrorMessage,
}

export const ErrorObject: Story = {
	args: {
		error: new Error('This is error text'),
	} satisfies PropsForErrorMessage,
}
