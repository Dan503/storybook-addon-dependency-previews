import { getErrorText } from './getErrorText'
import styles from './ErrorMessage.module.css'

export interface PropsForErrorMessage {
	error: string | Error
}

export function ErrorMessage({ error }: PropsForErrorMessage) {
	return <p className={styles.errorMessage}>{getErrorText(error)}</p>
}
