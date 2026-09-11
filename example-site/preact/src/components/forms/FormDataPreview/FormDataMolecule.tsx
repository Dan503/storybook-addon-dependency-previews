import { FormDataPreviewAtom } from './FormDataPreviewAtom'
import type { FormSchema } from '@formisch/preact'
import type { ComponentChildren } from 'preact'
import type { WithForm } from '../FormTypes'

interface PropsForFormDataWrapper<
	TSchema extends FormSchema,
> extends WithForm<TSchema> {
	children?: ComponentChildren
}

export function FormDataMolecule<TSchema extends FormSchema>({
	form,
	children,
}: PropsForFormDataWrapper<TSchema>) {
	return (
		<div class="grid gap-2">
			{children}
			<FormDataPreviewAtom form={form} />
		</div>
	)
}
