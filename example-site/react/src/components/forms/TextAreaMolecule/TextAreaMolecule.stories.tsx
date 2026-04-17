import { Field, Form } from 'react-final-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TriggerErrors } from '../TriggerErrors'
import { TextAreaMolecule } from './TextAreaMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from '@storybook/react-vite'

const meta: Meta<typeof TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

interface FormValues {
	message: string
}

export const Primary = {
	render: () => (
		<Form
			onSubmit={() => {}}
			render={({ handleSubmit, values }) => (
				<form onSubmit={handleSubmit}>
					<FormDataMolecule formValues={values}>
						<Field<FormValues> name="message">
							{(props) => (
								<TextAreaMolecule
									{...props}
									label="Your message"
									placeholder="Type your message here..."
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
							name="message"
							validate={(value: string) =>
								!value
									? 'Message is required'
									: value.length < 10
										? 'Message must be at least 10 characters'
										: undefined
							}
						>
							{(props) => (
								<>
									<TriggerErrors<FormValues> fieldName="message" />
									<TextAreaMolecule
										{...props}
										label="Your message"
										placeholder="Type your message here..."
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
