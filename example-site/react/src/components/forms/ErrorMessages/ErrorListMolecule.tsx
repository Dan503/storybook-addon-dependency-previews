import type { FormErrors } from '../FormTypes'
import { ErrorMessageAtom } from './ErrorMessageAtom'

export interface PropsForErrorListMolecule {
	errors: FormErrors
}

export function ErrorListMolecule({ errors }: PropsForErrorListMolecule) {
	return (
		<ul className="grid gap-1 pl-6">
			{errors?.map((err) => (
				<li
					key={err instanceof Error ? err.message : err}
					className="list-disc list-outside"
				>
					<ErrorMessageAtom error={err} />
				</li>
			))}
		</ul>
	)
}
