import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import {
	defaultContactFormValues,
	type ContactFormOutputData,
} from 'example-site-shared/data'
import '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'
import type { FormDataMolecule } from '../../zz-meta-components/FormDataPreview/FormDataMolecule.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ContactFormOrganism.lit'
import type { ContactFormOrganism } from './ContactFormOrganism.lit'

/**
 * Shows the values the form was sent with.
 *
 * @param values - the values, once they have passed the checks
 */
function onContactFormSubmit(values: ContactFormOutputData) {
	const indentSpaces = 2
	const valuesText = JSON.stringify(values, null, indentSpaces)
	alert('Form submitted with these values:\n' + valuesText)
}

/**
 * Draws the form with its values written out below it, kept up to date as it
 * is typed in.
 *
 * @param args - the story's settings for the form
 */
function renderFormStory(args: Partial<ContactFormOrganism>) {
	const previewRef = createRef<FormDataMolecule>()

	// The form hears the typing first, from inside, so its values are already
	// up to date when the event reaches this listener on the outside of it.
	const onInput = (event: Event) => {
		const form = event.currentTarget as ContactFormOrganism
		previewRef.value!.values = form.values
	}

	return html`<app-form-data-molecule
		${ref(previewRef)}
		.values=${defaultContactFormValues}
	>
		<app-contact-form-organism
			.shouldShowErrorsFromStart=${args.shouldShowErrorsFromStart ?? false}
			.onSubmit=${onContactFormSubmit}
			@input=${onInput}
		></app-contact-form-organism>
	</app-form-data-molecule>`
}

const meta: Meta<ContactFormOrganism> = {
	title: 'Forms / Contact Form Organism',
	component: 'app-contact-form-organism',
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ContactFormOrganism>

export const Primary: Story = {
	render: (args) => renderFormStory(args),
}

export const ErrorState: Story = {
	name: 'Error State',
	args: { shouldShowErrorsFromStart: true },
	render: (args) => renderFormStory(args),
}
