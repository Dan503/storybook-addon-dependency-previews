import { Field, Form, getDeepErrors } from '@formisch/solid'
import { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule'
import { ButtonAtom } from '../../01-atoms/ButtonAtom'
import type { FormStore, SubmitHandler } from '@formisch/solid'
import type { ContactFormSchemaType } from 'example-site-shared/data'
import { ErrorBlockOrganism } from '../ErrorMessages/ErrorBlockOrganism'
import { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule'

export interface PropsForContactFormOrganism {
	form: FormStore<ContactFormSchemaType>
	onSubmit: SubmitHandler<ContactFormSchemaType>
}

export function ContactFormOrganism({
	form,
	onSubmit,
}: PropsForContactFormOrganism) {
	return (
		<div class="grid gap-4">
			{/* Read inside the markup, not into a variable above it. Checking the
			form finishes just after the first draw, and Solid only re-draws the
			parts of the page that read a value from inside the markup. */}
			<ErrorBlockOrganism errors={getDeepErrors(form)} />
			<Form
				class="ContactFormOrganism grid gap-4"
				of={form}
				onSubmit={onSubmit}
			>
				<Field of={form} path={['name']}>
					{(field) => (
						<TextFieldMolecule
							label="Name"
							placeholder="Your name"
							field={field}
						/>
					)}
				</Field>

				<Field of={form} path={['email']}>
					{(field) => (
						<TextFieldMolecule
							label="Email"
							placeholder="example@email.com"
							field={field}
						/>
					)}
				</Field>

				<Field of={form} path={['message']}>
					{(field) => (
						<TextAreaMolecule
							label="Message"
							placeholder="Type your message here..."
							field={field}
						/>
					)}
				</Field>

				<div class="flex justify-end">
					<ButtonAtom type="submit">Send</ButtonAtom>
				</div>
			</Form>
		</div>
	)
}
