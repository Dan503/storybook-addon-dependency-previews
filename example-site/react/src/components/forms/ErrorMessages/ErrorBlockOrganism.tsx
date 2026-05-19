import { ErrorListMolecule } from './ErrorListMolecule'
import type { FormErrors } from '../FormTypes'

export interface PropsForErrorBlockOrganism {
	errors: FormErrors
}

export function ErrorBlockOrganism({ errors }: PropsForErrorBlockOrganism) {
	if (!errors?.length) return null
	return (
		<div role="alert" className="bg-red-100 px-4 pt-2 rounded-xl">
			<h2 className="text-2xl font-bold border-b-2 border-red-800 pb-1">
				Please resolve the following errors
			</h2>
			<div className="pt-3 pb-4">
				<ErrorListMolecule errors={errors} />
			</div>
		</div>
	)
}
