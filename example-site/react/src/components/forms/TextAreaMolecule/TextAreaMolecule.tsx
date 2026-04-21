import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { FinalFormInputProps } from '../FormTypes'

interface PropsForTextAreaMolecule extends FinalFormInputProps<
	string,
	HTMLTextAreaElement
> {
	label: string
	placeholder?: string
}

export function TextAreaMolecule({
	label,
	name,
	placeholder,
	input,
	meta,
	idPrefix = 'field',
}: PropsForTextAreaMolecule) {
	const id = [idPrefix, name].join('-')
	const showErrors = Boolean((meta.touched || meta.submitFailed) && meta.error)
	const errors = showErrors ? [meta.error] : []

	return (
		<div>
			<label htmlFor={id} className="block mb-1 w-full">
				<span className="font-bold text-xl">{label}</span>
				<div className="grid grid-cols-[minmax(0,1fr)]">
					<textarea
						id={id}
						{...input}
						placeholder={placeholder}
						className={`col-start-1 row-start-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showErrors ? 'placeholder-red-900/60' : ''}`}
					/>
					<span className="col-start-1 row-start-1 px-4 py-2 pointer-events-none whitespace-pre-wrap invisible">
						{input.value}{' '}
					</span>
				</div>
			</label>
			{showErrors && <ErrorListMolecule errors={errors} />}
		</div>
	)
}
