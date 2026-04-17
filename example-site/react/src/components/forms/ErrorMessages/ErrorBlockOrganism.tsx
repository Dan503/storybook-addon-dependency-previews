import { clsx } from 'clsx'
import { ErrorListMolecule } from './ErrorListMolecule'
import type { FormApi, ValidationErrors } from 'final-form'

export interface PropsForErrorBlockOrganism<FormValues extends object> {
	errors: ValidationErrors
	form?: FormApi<FormValues>
}

export function ErrorBlockOrganism<FormValues extends object>({
	errors,
	form,
}: PropsForErrorBlockOrganism<FormValues>) {
	const hasErrors = errors && Object.keys(errors).length > 0
	if (!hasErrors) return null
	return (
		<div role="alert" className={clsx('bg-red-100 px-4 pt-2 rounded-xl')}>
			<div>
				<h2 className="text-2xl font-bold border-b-2 border-red-800 pb-1">
					Please resolve the following errors
				</h2>
				<div className="pt-3 pb-4">
					<ErrorListMolecule errors={errors} form={form} />
				</div>
			</div>
		</div>
	)
}
