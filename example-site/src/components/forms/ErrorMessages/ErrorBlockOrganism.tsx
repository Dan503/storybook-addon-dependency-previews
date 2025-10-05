import { clsx } from 'clsx'
import { ErrorListMolecule } from './ErrorListMolecule'

export interface PropsForErrorBlockOrganism {
	errors: Array<string | Error>
}

export function ErrorBlockOrganism({ errors }: PropsForErrorBlockOrganism) {
	return (
		<div
			role="alert"
			className={clsx('bg-red-100 px-4 pt-2 rounded-xl', {
				absolute: errors.length === 0,
			})}
		>
			{errors.length > 0 && (
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
