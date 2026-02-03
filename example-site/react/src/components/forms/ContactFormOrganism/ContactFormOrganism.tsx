import { useForm, useStore } from '@tanstack/react-form'
import { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule'
import { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule'
import { useEffect } from 'react'
import { ButtonAtom } from '../../01-atoms/ButtonAtom'

export const defaultContactFormValues = {
	name: '',
	email: '',
	message: '',
}

export type ContactFormValues = typeof defaultContactFormValues

export interface PropsForContactFormOrganism {
	onSubmit?: () => void
	onValuesChange?: (values: ContactFormValues) => void
}

export function ContactFormOrganism({
	onSubmit,
	onValuesChange,
}: PropsForContactFormOrganism) {
	const form = useForm({
		defaultValues: defaultContactFormValues,
		onSubmit: onSubmit,
	})
	const values = useStore(form.store, (state) => state.values)

	useEffect(() => {
		onValuesChange?.(values)
	}, [values])

	return (
		<form
			className="ContactFormOrganism grid gap-4"
			onSubmit={(event) => {
				event.preventDefault()
				form.handleSubmit(event)
			}}
		>
			<form.Field name="name">
				{(field) => (
					<TextFieldMolecule
						label="Name"
						placeholder="Your name"
						field={field}
					/>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<TextFieldMolecule
						label="Email"
						placeholder="example@email.com"
						field={field}
					/>
				)}
			</form.Field>

			<form.Field name="message">
				{(field) => (
					<TextAreaMolecule
						label="Message"
						placeholder="Type your message here..."
						field={field}
					/>
				)}
			</form.Field>

			<div className="flex justify-end">
				<ButtonAtom type="submit">Send</ButtonAtom>
			</div>
		</form>
	)
}
