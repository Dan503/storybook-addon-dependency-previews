import type { FormErrors } from '../FormTypes'
import { ErrorMessageAtom } from './ErrorMessageAtom'

export interface PropsForErrorListMolecule {
	errors: FormErrors
}

export function ErrorListMolecule({ errors }: PropsForErrorListMolecule) {
	return (
		<ul class="grid gap-1 pl-6">
			{errors?.map((err) => (
				<li class="list-disc list-outside">
					<ErrorMessageAtom error={err} />
				</li>
			))}
		</ul>
	)
}
