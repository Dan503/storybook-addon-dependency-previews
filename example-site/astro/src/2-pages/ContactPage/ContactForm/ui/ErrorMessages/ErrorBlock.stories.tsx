import type { Meta, StoryObj } from '@storybook/react'
import type { NonEmptyArray } from 'example-site-shared/utils'
import { ErrorBlock, type PropsForErrorBlock } from './ErrorBlock'

const meta: Meta<typeof ErrorBlock> = {
	component: ErrorBlock,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

type Story = StoryObj<typeof meta>

const errors: NonEmptyArray<string> = ['Error One', 'Second error']

export const ErrorStrings: Story = {
	args: {
		errors,
	} satisfies PropsForErrorBlock,
}

export const ErrorObjects: Story = {
	args: {
		errors: errors.map((errorText) => new Error(errorText)),
	} satisfies PropsForErrorBlock,
}
