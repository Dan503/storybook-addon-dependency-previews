import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { WithField } from '../FormTypes'
import { useStore, type AnyFieldApi } from '@tanstack/react-form'

export interface PropsForTextAreaMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<FieldApi extends AnyFieldApi> =
	PropsForTextAreaMolecule & WithField<FieldApi>

export function TextAreaMolecule<FieldApi extends AnyFieldApi>({
	field,
	label,
	placeholder,
}: FieldPropsForTextFieldMolecule<FieldApi>) {
	const errors = useStore(field.store, (s) => s.meta.errors)
	const id = field.name.replace(/\W/g, '')
	const showErrors = field.state.meta.isTouched && errors?.length > 0

	return (
		<div>
			<label htmlFor={id} className="block font-bold mb-1 text-xl w-full">
				{label}
				<div className="grid">
					<textarea
						id={id}
						value={field.state.value}
						placeholder={placeholder}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						className="col-start-1 row-start-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<span className="col-start-1 row-start-1 px-4 py-2 pointer-events-none whitespace-pre-wrap invisible">
						{field.state.value}{' '}
					</span>
				</div>
			</label>
			{showErrors && <ErrorListMolecule errors={errors} />}
		</div>
	)
}
