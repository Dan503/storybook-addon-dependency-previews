import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import type { FormErrors } from '../FormTypes'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ErrorListMolecule.lit'
import type { ErrorListMolecule } from './ErrorListMolecule.lit'

const errorStrings: Array<string> = ['Error One', 'Second error']
const errorObjects: FormErrors = errorStrings.map((error) => new Error(error))

const meta: Meta<ErrorListMolecule> = {
	title: 'Forms / Error Messages / Error List Molecule',
	component: 'app-error-list-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-error-list-molecule
			.errors=${args.errors}
		></app-error-list-molecule>`,
}

export default meta

type Story = StoryObj<ErrorListMolecule>

export const ErrorStrings: Story = {
	name: 'Error Strings',
	args: { errors: errorStrings },
}

export const ErrorObjects: Story = {
	name: 'Error Objects',
	args: { errors: errorObjects },
}
