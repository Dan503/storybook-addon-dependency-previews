import type { FormErrors } from '../../model/FormTypes'
import { ErrorMessage } from './ErrorMessage'
import { getErrorText } from './getErrorText'
import styles from './ErrorList.module.css'

export interface PropsForErrorList {
	/** The errors to list. */
	errors: FormErrors
	id?: string
}

/** A list of error messages, shown under a field that has errors and in the error summary above the form. */
export function ErrorList({ errors, id }: PropsForErrorList) {
	return (
		<ul className={styles.errorList} id={id}>
			{errors?.map((error) => (
				<li key={getErrorText(error)}>
					<ErrorMessage error={error} />
				</li>
			))}
		</ul>
	)
}
