import { ErrorMessageAtom } from './ErrorMessageAtom'
import type { FormApi, ValidationErrors } from 'final-form'

export interface PropsForErrorListMolecule<FormValues extends object> {
	errors: ValidationErrors
	form?: FormApi<FormValues>
}

export function ErrorListMolecule<FormValues extends object>({
	errors,
	form,
}: PropsForErrorListMolecule<FormValues>) {
	const errorArray = Object.entries(errors || {})

	return (
		<ul className="grid gap-1 pl-6">
			{errorArray.map(([key, err]) => {
				const field = form?.getFieldState(key as keyof FormValues)
				return (
					<li key={key} className="list-disc list-outside">
						<ErrorMessageAtom error={err} field={field} />
					</li>
				)
			})}
		</ul>
	)
}
