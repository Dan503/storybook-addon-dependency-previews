import type { FormErrors } from '../../model/FormTypes'
import { ErrorMessage } from './ErrorMessage'
import { getErrorText } from './getErrorText'
import styles from './ErrorList.module.css'

export interface PropsForErrorList {
	errors: FormErrors
}

export function ErrorList({ errors }: PropsForErrorList) {
	return (
		<ul className={styles.errorList}>
			{errors?.map((error) => (
				<li key={getErrorText(error)}>
					<ErrorMessage error={error} />
				</li>
			))}
		</ul>
	)
}
