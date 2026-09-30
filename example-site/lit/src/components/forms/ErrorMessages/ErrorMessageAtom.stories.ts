import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ErrorMessageAtom.lit'
import type { ErrorMessageAtom } from './ErrorMessageAtom.lit'

const meta: Meta<ErrorMessageAtom> = {
	title: 'Forms / Error Messages / Error Message Atom',
	component: 'app-error-message-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-error-message-atom
			.error=${args.error}
		></app-error-message-atom>`,
}

export default meta

type Story = StoryObj<ErrorMessageAtom>

export const ErrorString: Story = {
	name: 'Error string',
	args: { error: 'This is an error message as a string' },
}

export const ErrorObject: Story = {
	name: 'Error object',
	args: { error: new Error('This is an error message as an Error() object') },
}
