import { Field, Form } from 'react-final-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TriggerErrors } from '../TriggerErrors'
import { TextFieldMolecule } from './TextFieldMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from '@storybook/react-vite'

const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms/Text Field Molecule',
	component: TextFieldMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

interface FormValues {
	firstName: string
}

export const Default = {
	render: () => (
		<Form
			onSubmit={() => {}}
			initialValues={{ firstName: '' } satisfies FormValues}
			render={({ handleSubmit, values }) => (
				<form onSubmit={handleSubmit}>
					<FormDataMolecule formValues={values}>
						<Field<FormValues> name="firstName">
							{(props) => (
								<TextFieldMolecule
									{...props}
									label="First name"
									placeholder="Placeholder text"
								/>
							)}
						</Field>
					</FormDataMolecule>
				</form>
			)}
		/>
	),
}

export const ErrorState = {
	render: () => (
		<Form
			onSubmit={() => {}}
			render={({ handleSubmit, values }) => (
				<form onSubmit={handleSubmit}>
					<FormDataMolecule formValues={values}>
						<Field<FormValues>
							name="firstName"
							validate={(value: string) =>
								!value
									? 'First name is required'
									: value.length < 3
										? 'First name must be at least 3 characters'
										: undefined
							}
						>
							{(props) => (
								<>
									<TriggerErrors<FormValues> fieldName="firstName" />
									<TextFieldMolecule
										{...props}
										label="First name"
										placeholder="Placeholder text"
									/>
								</>
							)}
						</Field>
					</FormDataMolecule>
				</form>
			)}
		/>
	),
}
