import { getInput, useSignals, type Schema } from '@formisch/react'
import type { WithForm } from '../../model/FormTypes'
import styles from './FormDataPreview.module.css'

/** Prints the form's current values, keeping up as they change. */
export function FormDataPreview<TSchema extends Schema>({
	form,
}: WithForm<TSchema>) {
	// Draws this component again whenever a form value read below changes.
	useSignals()
	const formValues = getInput(form)
	const indentSpaces = 3

	return (
		<pre className={styles.formDataPreview}>
			<code>{JSON.stringify(formValues, null, indentSpaces)}</code>
		</pre>
	)
}
