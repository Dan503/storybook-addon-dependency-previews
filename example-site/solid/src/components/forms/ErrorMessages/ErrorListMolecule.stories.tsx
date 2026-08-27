import type { Meta } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { ArrayWithValue } from 'example-site-shared/utils'
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

const errors: ArrayWithValue<string> = ['Error One', 'Second error']

export const ErrorStrings = {
	args: {
		errors,
	} satisfies PropsForErrorListMolecule,
}

export const ErrorObjects = {
	args: {
		errors: errors.map((err) => new Error(err)),
	} satisfies PropsForErrorListMolecule,
}
