import type { ValidationMode } from '@formisch/react'
import type { Meta } from '@storybook/react'
import type { ContactFormOutputData } from 'example-site-shared/data'
import { useContactForm } from '../../model/useContactForm'
import { FormFieldWithDataPreview } from '../../storybook-only/FormFieldWithDataPreview/FormFieldWithDataPreview'
import { ContactFormFields } from './ContactFormFields'

const meta: Meta<typeof ContactFormFields> = {
	component: ContactFormFields,
	parameters: {
		renderer: 'react',
	},
}

export default meta

function showSubmittedValues(output: ContactFormOutputData) {
	const indentSpaces = 2
	const submittedValuesText = JSON.stringify(output, null, indentSpaces)
	alert('Form submitted with these values:\n' + submittedValuesText)
}

interface PropsForContactFormFieldsWithForm {
	validate?: ValidationMode
}

function ContactFormFieldsWithForm({
	validate,
}: PropsForContactFormFieldsWithForm) {
	const form = useContactForm(validate)

	return (
		<FormFieldWithDataPreview form={form}>
			<ContactFormFields form={form} onSubmit={showSubmittedValues} />
		</FormFieldWithDataPreview>
	)
}

export const Primary = {
	render: () => <ContactFormFieldsWithForm />,
}

export const ErrorState = {
	render: () => <ContactFormFieldsWithForm validate="initial" />,
}
