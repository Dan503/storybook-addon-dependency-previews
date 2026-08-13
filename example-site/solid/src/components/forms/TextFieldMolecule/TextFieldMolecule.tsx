import { createUniqueId, Show } from 'solid-js'
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
>(props: FieldPropsForTextFieldMolecule<TSchema, TPath>) {
	// Built from a counter rather than the label, so that two fields sharing a
	// label — which the stories for this component do — still get an id each.
	const id = createUniqueId()
	// Written as a function so that each use below reads the errors afresh.
	// Checking the field finishes just after the first draw, and Solid only
	// re-draws the parts of the page that read a value from inside the markup.
	const checkHasErrors = () => (props.field.errors?.length ?? 0) > 0

	return (
		<div>
			<label for={id} class="block mb-1">
				<span class="text-xl font-bold">{props.label}</span>
				<input
					{...props.field.props}
					id={id}
					placeholder={props.placeholder}
					class={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${checkHasErrors() ? 'placeholder-red-900/60' : ''}`}
				/>
			</label>
			<Show when={checkHasErrors()}>
				<ErrorListMolecule errors={props.field.errors ?? []} />
			</Show>
		</div>
	)
}
