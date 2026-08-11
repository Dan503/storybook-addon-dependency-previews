import { Show } from 'solid-js'
import { ErrorListMolecule } from '../ErrorMessages/ErrorListMolecule'
import type { RequiredPath, FormSchema } from '@formisch/solid'
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
	const id = `ID-${label.replace(/\W/g, '')}`
	// Written as a function so that each use below reads the errors afresh.
	// Checking the field finishes just after the first draw, and Solid only
	// re-draws the parts of the page that read a value from inside the markup.
	const checkHasErrors = () => (field.errors?.length ?? 0) > 0

	return (
		<div>
			<label for={id} class="block mb-1">
				<span class="text-xl font-bold">{label}</span>
				<input
					{...field.props}
					id={id}
					placeholder={placeholder}
					class={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${checkHasErrors() ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			<Show when={checkHasErrors()}>
				<ErrorListMolecule errors={field.errors ?? []} />
			</Show>
		</div>
	)
}
