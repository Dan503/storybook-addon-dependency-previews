import { clsx } from 'clsx'
import { ErrorListMolecule } from './ErrorListMolecule'

export interface PropsForErrorBlockOrganism {
  errors: Array<string | Error>
}

export function ErrorBlockOrganism({ errors }: PropsForErrorBlockOrganism) {
  return (
    <div
      role="alert"
      className={clsx({
        absolute: errors.length === 0,
      })}
    >
      {errors.length > 0 && (
        <div>
          <h2>Please resolve the following errors</h2>
          <ErrorListMolecule errors={errors} />
        </div>
      )}
    </div>
  )
}
