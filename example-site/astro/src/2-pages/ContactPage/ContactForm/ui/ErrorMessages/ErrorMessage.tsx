import { getErrorText } from './getErrorText'
import styles from './ErrorMessage.module.css'

export interface PropsForErrorMessage {
	/** The error to show, as text or as an `Error` whose message is shown. */
	error: string | Error
}

/** One error message. */
export function ErrorMessage({ error }: PropsForErrorMessage) {
	return <p className={styles.errorMessage}>{getErrorText(error)}</p>
}
