import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ErrorMessageAtom,
	type PropsForErrorMessageAtom,
} from './ErrorMessageAtom'

const meta: Meta<typeof ErrorMessageAtom> = {
	title: 'Forms / Error Messages / Error Message Atom',
	component: ErrorMessageAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const ErrorStrings: Story = {
	args: {
		error: 'This is error text',
	} satisfies PropsForErrorMessageAtom,
}

export const ErrorObjects: Story = {
	args: {
		error: new Error('This is error text'),
	} satisfies PropsForErrorMessageAtom,
}
