import { useId } from 'preact/hooks'
import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { FormSchema, RequiredPath } from '@formisch/preact'
import type { WithField } from '../FormTypes'

export interface PropsForTextAreaMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextAreaMolecule<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
> = PropsForTextAreaMolecule & WithField<TSchema, TPath>

export function TextAreaMolecule<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
>({
	field,
	label,
	placeholder,
}: FieldPropsForTextAreaMolecule<TSchema, TPath>) {
	const id = useId()
	// Read through `.value` because Formisch's Preact build hands a field's
	// errors and its typed-in text over as signals — small boxes holding a
	// value that tell the page to redraw when it changes.
	const errors = field.errors.value
	const hasErrors = (errors?.length ?? 0) > 0

	return (
		<div>
			<label for={id} class="block mb-1 w-full">
				<span class="font-bold text-xl">{label}</span>
				<div class="grid grid-cols-[minmax(0,1fr)]">
					<textarea
						{...field.props}
						id={id}
						placeholder={placeholder}
						class={`col-start-1 row-start-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hasErrors ? 'placeholder-red-900/60' : ''}`}
					/>
					{/* An invisible copy of what has been typed, sharing the same grid
					cell as the box above. It is what gives the cell its height, so the
					box grows as the message does instead of gaining a scrollbar. The
					trailing space keeps a newline at the end from collapsing. */}
					<span class="col-start-1 row-start-1 px-4 py-2 pointer-events-none whitespace-pre-wrap invisible">
						{String(field.input.value ?? '')}{' '}
					</span>
				</div>
			</label>
			{hasErrors && <ErrorListMolecule errors={errors} />}
		</div>
	)
}
