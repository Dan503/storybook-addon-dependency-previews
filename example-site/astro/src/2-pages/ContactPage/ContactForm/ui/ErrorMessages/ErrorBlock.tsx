import type { FormErrors } from '../../model/FormTypes'
import { ErrorList } from './ErrorList'
import styles from './ErrorBlock.module.css'

export interface PropsForErrorBlock {
	/** Every error in the form. */
	errors: FormErrors
}

/** The summary of every error in the form, shown above the form. Draws nothing while there are no errors.
 *
 * After working on the Accessibility for the demo site, I realised that the block isn't needed due to the inline errors.
 *
 * It was actually making accessibility worse due to the role="alert" attribute
 */
export function ErrorBlock({ errors }: PropsForErrorBlock) {
	if (!errors?.length) return null

	return (
		<div role="alert" className={styles.errorBlock}>
			<h2 className={styles.heading}>Please resolve the following errors</h2>
			<div className={styles.errors}>
				<ErrorList errors={errors} />
			</div>
		</div>
	)
}
