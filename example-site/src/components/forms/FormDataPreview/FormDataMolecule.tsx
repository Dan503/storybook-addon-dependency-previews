import type { AnyFormApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { FormDataPreviewAtom } from './FormDataPreviewAtom'

interface PropsForFormDataWrapper<FormApi extends AnyFormApi> {
	formValues?: FormApi['state']['values']
	children: ReactNode
}

export function FormDataMolecule<FormApi extends AnyFormApi>({
	formValues,
	children,
}: PropsForFormDataWrapper<FormApi>) {
	return (
		<div className="grid gap-2">
			{children}
			<FormDataPreviewAtom formValues={formValues} />
		</div>
	)
}
