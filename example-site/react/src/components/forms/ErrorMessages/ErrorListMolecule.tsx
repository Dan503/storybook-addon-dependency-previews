import { ErrorMessageAtom } from './ErrorMessageAtom'
import type { ValidationErrors } from 'final-form'

export interface PropsForErrorListMolecule {
	errors: ValidationErrors
}

export function ErrorListMolecule({ errors }: PropsForErrorListMolecule) {
	const errorArray = Object.entries(errors || {})

	return (
		<ul className="grid gap-1 pl-6">
			{errorArray.map(([key, err]) => (
				<li key={key} className="list-disc list-outside">
					<ErrorMessageAtom error={err} />
				</li>
			))}
		</ul>
	)
}
