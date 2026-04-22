import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { RequiredPath, Schema } from '@formisch/react'
import type { WithField, WithForm } from '../FormTypes'

export interface PropsForTextFieldMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextFieldMolecule & WithForm<TSchema> & WithField<TSchema, TPath>

export function TextFieldMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
>({
	label,
	placeholder,
	field,
	form,
}: FieldPropsForTextFieldMolecule<TSchema, TPath>) {
	const id = [form['~internal'].name, ...field.path].join('-')
	const showErrors = (field.errors?.length ?? 0) > 0

	return (
		<div>
			<label htmlFor={id} className="block mb-1">
				<span className="text-xl font-bold">{label}</span>
				<input
					{...field.props}
					id={id}
					placeholder={placeholder}
					className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showErrors ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			{showErrors && <ErrorListMolecule errors={field.errors ?? []} />}
		</div>
	)
}
