import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { FinalFormInputProps } from '../FormTypes'

interface PropsForTextFieldMolecule extends FinalFormInputProps<
	string,
	HTMLInputElement
> {
	label: string
	placeholder?: string
}

export function TextFieldMolecule({
	label,
	placeholder,
	name,
	input,
	meta,
}: PropsForTextFieldMolecule) {
	const showErrors = Boolean((meta.touched || meta.submitFailed) && meta.error)
	const id = `field-${name}`

	return (
		<div>
			<label htmlFor={id} className="block mb-1">
				<span className="text-xl font-bold">{label}</span>
				<input
					{...input}
					placeholder={placeholder}
					id={id}
					type="text"
					className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showErrors ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			{showErrors && <ErrorListMolecule errors={[meta.error]} />}
		</div>
	)
}
