import { useId } from 'preact/hooks'
import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { FormSchema, RequiredPath } from '@formisch/preact'
import type { WithField } from '../FormTypes'

export interface PropsForTextFieldMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
> = PropsForTextFieldMolecule & WithField<TSchema, TPath>

export function TextFieldMolecule<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
>({
	label,
	placeholder,
	field,
}: FieldPropsForTextFieldMolecule<TSchema, TPath>) {
	const id = useId()
	// Read through `.value` because Formisch's Preact build hands a field's
	// errors over as a signal — a small box holding a value that tells the page
	// to redraw when it changes.
	const errors = field.errors.value
	const hasErrors = (errors?.length ?? 0) > 0

	return (
		<div>
			<label for={id} class="block mb-1">
				<span class="text-xl font-bold">{label}</span>
				<input
					{...field.props}
					id={id}
					placeholder={placeholder}
					class={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hasErrors ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			{hasErrors && <ErrorListMolecule errors={errors} />}
		</div>
	)
}
