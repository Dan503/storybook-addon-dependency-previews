import { Field, Form, getAllErrors } from '@formisch/react'
import { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule'
import { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule'
import { ButtonAtom } from '../../01-atoms/ButtonAtom'
import type { FormStore, SubmitHandler } from '@formisch/react'
import type { ContactFormSchemaType } from 'example-site-shared/data'
import { ErrorBlockOrganism } from '../ErrorMessages/ErrorBlockOrganism'

export interface PropsForContactFormOrganism {
	form: FormStore<ContactFormSchemaType>
	onSubmit: SubmitHandler<ContactFormSchemaType>
}

export function ContactFormOrganism({
	form,
	onSubmit,
}: PropsForContactFormOrganism) {
	const errors = getAllErrors(form)
	return (
		<div className="grid gap-4">
			<ErrorBlockOrganism errors={errors} />
			<Form
				className="ContactFormOrganism grid gap-4"
				of={form}
				onSubmit={onSubmit}
			>
				<Field of={form} path={['name']}>
					{(field) => (
						<TextFieldMolecule
							label="Name"
							placeholder="Your name"
							form={form}
							field={field}
						/>
					)}
				</Field>

				<Field of={form} path={['email']}>
					{(field) => (
						<TextFieldMolecule
							label="Email"
							placeholder="example@email.com"
							form={form}
							field={field}
						/>
					)}
				</Field>

				<Field of={form} path={['message']}>
					{(field) => (
						<TextAreaMolecule
							label="Message"
							placeholder="Type your message here..."
							form={form}
							field={field}
						/>
					)}
				</Field>

				<div className="flex justify-end">
					<ButtonAtom type="submit">Send</ButtonAtom>
				</div>
			</Form>
		</div>
	)
}
