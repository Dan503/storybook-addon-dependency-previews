import type { ReactNode } from 'react'
import { FormDataPreviewAtom } from './FormDataPreviewAtom'

interface PropsForFormDataWrapper<FormValues extends Record<string, any>> {
	formValues?: FormValues
	children: ReactNode
}

export function FormDataMolecule<FormValues extends Record<string, any>>({
	formValues,
	children,
}: PropsForFormDataWrapper<FormValues>) {
	return (
		<div className="grid gap-2">
			{children}
			<FormDataPreviewAtom formValues={formValues} />
		</div>
	)
}
