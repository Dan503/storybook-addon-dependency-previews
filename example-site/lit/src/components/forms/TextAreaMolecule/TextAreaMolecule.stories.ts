import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import {
	defaultMessageOnlyValues,
	messageOnlySchema,
	type MessageOnlyInputData,
} from 'example-site-shared/data'
import { getFieldErrors } from '../getFieldErrors'
import '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'
import type { FormDataMolecule } from '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './TextAreaMolecule.lit'
import type { TextAreaMolecule } from './TextAreaMolecule.lit'

/**
 * Draws the field in a one-field form, with its value written out below it.
 *
 * Once checking is on, the field is checked on every change. Enter adds a new
 * line here rather than sending, so, as on the sibling sites, only the Error
 * State story checks the field.
 *
 * @param args - the story's label and placeholder
 * @param isCheckingFromStart - check the field from the first draw, so its
 * errors show before anything is typed
 */
function renderFieldStory(
	args: Partial<TextAreaMolecule>,
	isCheckingFromStart: boolean,
) {
	const fieldRef = createRef<TextAreaMolecule>()
	const previewRef = createRef<FormDataMolecule>()
	let values: MessageOnlyInputData = {
		message: defaultMessageOnlyValues.message ?? '',
	}

	const getErrors = () => {
		if (!isCheckingFromStart) {
			return null
		}
		return getFieldErrors(messageOnlySchema, values).message ?? null
	}

	const onInput = () => {
		values = { message: fieldRef.value!.value }
		fieldRef.value!.errors = getErrors()
		previewRef.value!.values = values
	}

	return html`<app-form-data-molecule ${ref(previewRef)} .values=${values}>
		<app-text-area-molecule
			${ref(fieldRef)}
			name="message"
			.label=${args.label ?? ''}
			.placeholder=${args.placeholder ?? ''}
			.value=${values.message}
			.errors=${getErrors()}
			@input=${onInput}
		></app-text-area-molecule>
	</app-form-data-molecule>`
}

const meta: Meta<TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	component: 'app-text-area-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	args: {
		label: 'Message',
		placeholder: 'Enter your message',
	},
}

export default meta

type Story = StoryObj<TextAreaMolecule>

export const Primary: Story = {
	render: (args) => renderFieldStory(args, false),
}

export const ErrorState: Story = {
	name: 'Error State',
	render: (args) => renderFieldStory(args, true),
}
