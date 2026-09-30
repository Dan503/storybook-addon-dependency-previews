import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import {
	defaultFirstNameOnlyValues,
	firstNameOnlySchema,
	type FirstNameOnlyInputData,
} from 'example-site-shared/data'
import { getFieldErrors } from '../getFieldErrors'
import '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'
import type { FormDataMolecule } from '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './TextFieldMolecule.lit'
import type { TextFieldMolecule } from './TextFieldMolecule.lit'

/**
 * Draws the field in a one-field form, with its value written out below it.
 *
 * As on the sibling sites, the field is checked once Enter is first pressed in
 * it, and on every change after that. A value that passes is shown in an
 * alert.
 *
 * @param args - the story's label and placeholder
 * @param isCheckingFromStart - check the field from the first draw, so its
 * errors show before anything is typed
 */
function renderFieldStory(
	args: Partial<TextFieldMolecule>,
	isCheckingFromStart: boolean,
) {
	const fieldRef = createRef<TextFieldMolecule>()
	const previewRef = createRef<FormDataMolecule>()
	let isChecking = isCheckingFromStart
	let values: FirstNameOnlyInputData = {
		firstName: defaultFirstNameOnlyValues.firstName ?? '',
	}

	const getErrors = () => {
		if (!isChecking) {
			return null
		}
		return getFieldErrors(firstNameOnlySchema, values).firstName ?? null
	}

	const onInput = () => {
		values = { firstName: fieldRef.value!.value }
		fieldRef.value!.errors = getErrors()
		previewRef.value!.values = values
	}

	const onSubmit = () => {
		isChecking = true
		const errors = getErrors()
		fieldRef.value!.errors = errors
		if (!errors) {
			const indentSpaces = 2
			alert(JSON.stringify(values, null, indentSpaces))
		}
	}

	return html`<app-form-data-molecule ${ref(previewRef)} .values=${values}>
		<app-text-field-molecule
			${ref(fieldRef)}
			name="firstName"
			.label=${args.label ?? ''}
			.placeholder=${args.placeholder ?? ''}
			.value=${values.firstName}
			.errors=${getErrors()}
			.onSubmit=${onSubmit}
			@input=${onInput}
		></app-text-field-molecule>
	</app-form-data-molecule>`
}

const meta: Meta<TextFieldMolecule> = {
	title: 'Forms / Text Field Molecule',
	component: 'app-text-field-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	args: {
		label: 'First Name',
		placeholder: 'Enter your first name',
	},
}

export default meta

type Story = StoryObj<TextFieldMolecule>

export const Primary: Story = {
	render: (args) => renderFieldStory(args, false),
}

export const ErrorState: Story = {
	name: 'Error State',
	render: (args) => renderFieldStory(args, true),
}
