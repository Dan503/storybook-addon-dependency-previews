import { clsx } from 'clsx'
import { ErrorListMolecule } from './ErrorListMolecule'
import type { FormErrors } from '../FormTypes'

export interface PropsForErrorBlockOrganism {
	errors: FormErrors
}

export function ErrorBlockOrganism({ errors }: PropsForErrorBlockOrganism) {
	const hasErrors = (errors?.length ?? 0) > 0
	return (
		<div
			role="alert"
			className={clsx('bg-red-100 px-4 pt-2 rounded-xl', {
				absolute: !hasErrors,
				invisible: !hasErrors,
			})}
		>
			{hasErrors && (
				<div>
					<h2 className="text-2xl font-bold border-b-2 border-red-800 pb-1">
						Please resolve the following errors
					</h2>
					<div className="pt-3 pb-4">
						<ErrorListMolecule errors={errors} />
					</div>
				</div>
			)}
		</div>
	)
}
