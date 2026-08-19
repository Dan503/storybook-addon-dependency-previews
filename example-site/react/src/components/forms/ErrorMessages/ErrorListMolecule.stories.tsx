import type { Meta } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ErrorListMolecule,
	type PropsForErrorListMolecule,
} from './ErrorListMolecule'

// Button.stories.tsx
const meta: Meta<typeof ErrorListMolecule> = {
	title: 'Forms/Error Messages/Error List Molecule',
	component: ErrorListMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

// Typed as a "one or more" list because that is the shape a form field's
// errors come in — a plain string[] is not accepted.
const errors: [string, ...Array<string>] = ['Error One', 'Second error']

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
