import {
	contactFormValuesSchema,
	defaultContactFormValues,
} from 'example-site-shared/data'
import { Form } from 'react-final-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TriggerErrors } from '../TriggerErrors'
import { ContactFormOrganism } from './ContactFormOrganism'
import type {
	ContactFormErrors,
	ContactFormValues,
} from 'example-site-shared/data'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from '@storybook/react-vite'

const meta: Meta<typeof ContactFormOrganism> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

function validate(values: ContactFormValues): ContactFormErrors {
	const result = contactFormValuesSchema.safeParse(values)
	if (result.success) return {}
	const errors: ContactFormErrors = {}
	for (const issue of result.error.issues) {
		const field = issue.path[0] as keyof ContactFormValues
		if (!errors[field]) errors[field] = issue.message
	}
	return errors
}

export const Primary = {
	render: () => (
		<Form
			onSubmit={(values) =>
				alert('Form submitted!\n' + JSON.stringify(values, null, 2))
			}
			initialValues={defaultContactFormValues}
			validate={validate}
			render={(formProps) => (
				<FormDataMolecule formValues={formProps.values}>
					<ContactFormOrganism {...formProps} />
				</FormDataMolecule>
			)}
		/>
	),
}

export const ErrorState = {
	render: () => (
		<Form
			onSubmit={() => {}}
			initialValues={defaultContactFormValues}
			validate={validate}
			render={(formProps) => (
				<FormDataMolecule formValues={formProps.values}>
					<TriggerErrors />
					<ContactFormOrganism {...formProps} />
				</FormDataMolecule>
			)}
		/>
	),
}
