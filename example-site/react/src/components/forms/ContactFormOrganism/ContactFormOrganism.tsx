import { Field } from 'react-final-form'
import { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule'
import { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule'
import { ButtonAtom } from '../../01-atoms/ButtonAtom'
import type { FormRenderProps } from 'react-final-form'
import type { ContactFormValues } from 'example-site-shared/data'

export interface PropsForContactFormOrganism extends FormRenderProps<ContactFormValues> {}

export function ContactFormOrganism({
	handleSubmit,
}: FormRenderProps<ContactFormValues>) {
	return (
		<form className="ContactFormOrganism grid gap-4" onSubmit={handleSubmit}>
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
