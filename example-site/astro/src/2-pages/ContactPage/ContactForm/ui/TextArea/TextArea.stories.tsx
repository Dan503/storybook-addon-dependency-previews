import { Field, useForm, type ValidationMode } from '@formisch/react'
import type { Meta } from '@storybook/react'
import {
	defaultMessageOnlyValues,
	messageOnlySchema,
} from 'example-site-shared/data'
import { FormFieldWithDataPreview } from '../../storybook-only/FormFieldWithDataPreview/FormFieldWithDataPreview'
import { TextArea, type PropsForTextArea } from './TextArea'

const meta: Meta<typeof TextArea> = {
	component: TextArea,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

interface PropsForTextAreaWithForm extends PropsForTextArea {
	validate?: ValidationMode
}

function TextAreaWithForm({ validate, ...props }: PropsForTextAreaWithForm) {
	const form = useForm({
		schema: messageOnlySchema,
		initialInput: defaultMessageOnlyValues,
		validate,
	})

	return (
		<FormFieldWithDataPreview form={form}>
			<Field of={form} path={['message']}>
				{(field) => <TextArea {...props} field={field} />}
			</Field>
		</FormFieldWithDataPreview>
	)
}

const args = {
	label: 'Your message',
	placeholder: 'Type your message here...',
} satisfies PropsForTextArea

export const Primary = {
	args,
	render: (storyArgs: PropsForTextArea) => <TextAreaWithForm {...storyArgs} />,
}

export const ErrorState = {
	args,
	render: (storyArgs: PropsForTextArea) => (
		<TextAreaWithForm {...storyArgs} validate="initial" />
	),
}
