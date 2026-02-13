import { useStore, type AnyFieldApi } from '@tanstack/react-form'
import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { WithField } from '../FormTypes'

export interface PropsForTextFieldMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<FieldApi extends AnyFieldApi> =
	PropsForTextFieldMolecule & WithField<FieldApi>

export function TextFieldMolecule<FieldApi extends AnyFieldApi>({
	label,
	placeholder,
	field,
}: FieldPropsForTextFieldMolecule<FieldApi>) {
	const errors = useStore(field.store, (s) => s.meta.errors)
	const id = field.name.replace(/\W/g, '')
	const showErrors = field.state.meta.isTouched && errors?.length > 0

	return (
		<div>
			<label htmlFor={id} className="block mb-1">
				<span className="text-xl font-bold">{label}</span>
				<input
					id={id}
					value={field.state.value}
					placeholder={placeholder}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showErrors ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			{showErrors && <ErrorListMolecule errors={errors} />}
		</div>
	)
}
