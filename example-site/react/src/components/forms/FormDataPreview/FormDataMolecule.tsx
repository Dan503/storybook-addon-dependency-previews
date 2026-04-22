import { FormDataPreviewAtom } from './FormDataPreviewAtom'
import type { Schema } from '@formisch/react'
import type { ReactNode } from 'react'
import type { WithForm } from '../FormTypes'

interface PropsForFormDataWrapper<
	TSchema extends Schema,
> extends WithForm<TSchema> {
	children?: ReactNode
}

export function FormDataMolecule<TSchema extends Schema>({
	form,
	children,
}: PropsForFormDataWrapper<TSchema>) {
	return (
		<div className="grid gap-2">
			{children}
			<FormDataPreviewAtom form={form} />
		</div>
	)
}
