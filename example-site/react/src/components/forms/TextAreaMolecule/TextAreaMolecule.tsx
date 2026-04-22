import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { RequiredPath, Schema } from '@formisch/react'
import type { WithField, WithForm } from '../FormTypes'

export interface PropsForTextAreaMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextAreaMolecule & WithForm<TSchema> & WithField<TSchema, TPath>

export function TextAreaMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
>({
	form,
	field,
	label,
	placeholder,
}: FieldPropsForTextFieldMolecule<TSchema, TPath>) {
	const id = [form['~internal'].name, ...field.path].join('-')
	const showErrors = (field.errors?.length ?? 0) > 0

	return (
		<div>
			<label htmlFor={id} className="block mb-1 w-full">
				<span className="font-bold text-xl">{label}</span>
				<div className="grid grid-cols-[minmax(0,1fr)]">
					<textarea
						{...field.props}
						id={id}
						placeholder={placeholder}
						className={`col-start-1 row-start-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showErrors ? 'placeholder-red-900/60' : ''}`}
					/>
					<span className="col-start-1 row-start-1 px-4 py-2 pointer-events-none whitespace-pre-wrap invisible">
						{String(field.input ?? '')}{' '}
					</span>
				</div>
			</label>
			{showErrors && <ErrorListMolecule errors={field.errors ?? []} />}
		</div>
	)
}
