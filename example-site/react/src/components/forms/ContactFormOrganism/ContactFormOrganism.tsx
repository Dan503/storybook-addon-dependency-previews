import { Field, useForm } from 'react-final-form'
import { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule'
import { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule'
import { ButtonAtom } from '../../01-atoms/ButtonAtom'
import { ErrorBlockOrganism } from '../ErrorMessages/ErrorBlockOrganism'
import type { FormRenderProps } from 'react-final-form'
import type { ContactFormValues } from 'example-site-shared/data'

export interface PropsForContactFormOrganism extends FormRenderProps<ContactFormValues> {}

export function ContactFormOrganism({
	handleSubmit,
	errors,
	submitFailed,
}: FormRenderProps<ContactFormValues>) {
	const form = useForm()
	return (
		<form className="ContactFormOrganism grid gap-4" onSubmit={handleSubmit}>
			{submitFailed && <ErrorBlockOrganism errors={errors} form={form} />}
			<Field<ContactFormValues> name="name">
				{(props) => (
					<TextFieldMolecule {...props} label="Name" placeholder="John Smith" />
				)}
			</Field>
			<Field<ContactFormValues> name="email">
				{(props) => (
					<TextFieldMolecule
						{...props}
						label="Email"
						placeholder="someone@email.com"
					/>
				)}
			</Field>
			<Field<ContactFormValues> name="message">
				{(props) => (
					<TextAreaMolecule
						{...props}
						label="Message"
						placeholder="Type your message here..."
					/>
				)}
			</Field>

			<div className="flex justify-end">
				<ButtonAtom type="submit">Send</ButtonAtom>
			</div>
		</form>
	)
}
