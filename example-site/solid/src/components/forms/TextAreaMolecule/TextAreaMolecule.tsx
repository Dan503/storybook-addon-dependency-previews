import { Show } from 'solid-js'
import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { FormSchema, RequiredPath } from '@formisch/solid'
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
	const id = `ID-${label.replace(/\W/g, '')}`
	// Written as a function so that each use below reads the errors afresh.
	// Checking the field finishes just after the first draw, and Solid only
	// re-draws the parts of the page that read a value from inside the markup.
	const checkHasErrors = () => (field.errors?.length ?? 0) > 0

	return (
		<div>
			<label for={id} class="block mb-1 w-full">
				<span class="font-bold text-xl">{label}</span>
				<div class="grid grid-cols-[minmax(0,1fr)]">
					<textarea
						{...field.props}
						id={id}
						placeholder={placeholder}
						class={`col-start-1 row-start-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${checkHasErrors() ? 'placeholder-red-900/60' : ''}`}
					/>
					<span class="col-start-1 row-start-1 px-4 py-2 pointer-events-none whitespace-pre-wrap invisible">
						{String(field.input ?? '')}{' '}
					</span>
				</div>
			</label>
			<Show when={checkHasErrors()}>
				<ErrorListMolecule errors={field.errors ?? []} />
			</Show>
		</div>
	)
}
