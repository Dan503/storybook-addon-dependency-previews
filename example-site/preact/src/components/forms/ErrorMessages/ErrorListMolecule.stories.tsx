import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { NonEmptyArray } from 'example-site-shared/utils'
import {
	ErrorListMolecule,
	type PropsForErrorListMolecule,
} from './ErrorListMolecule'

const meta: Meta<typeof ErrorListMolecule> = {
	title: 'Forms / Error Messages / Error List Molecule',
	component: ErrorListMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

const errors: NonEmptyArray<string> = ['Error One', 'Second error']

export const ErrorStrings: Story = {
	args: {
		errors,
	} satisfies PropsForErrorListMolecule,
}

export const ErrorObjects: Story = {
	args: {
		errors: errors.map((err) => new Error(err)),
	} satisfies PropsForErrorListMolecule,
}
