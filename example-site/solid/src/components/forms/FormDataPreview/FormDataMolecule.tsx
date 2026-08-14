import { FormDataPreviewAtom } from './FormDataPreviewAtom'
import type { FormSchema } from '@formisch/solid'
import type { WithForm } from '../FormTypes'
import type { JSX } from 'solid-js'

interface PropsForFormDataWrapper<
	TSchema extends FormSchema,
> extends WithForm<TSchema> {
	children?: JSX.Element
}

export function FormDataMolecule<TSchema extends FormSchema>(
	props: PropsForFormDataWrapper<TSchema>,
) {
	return (
		<div class="grid gap-2">
			{props.children}
			<FormDataPreviewAtom form={props.form} />
		</div>
	)
}
