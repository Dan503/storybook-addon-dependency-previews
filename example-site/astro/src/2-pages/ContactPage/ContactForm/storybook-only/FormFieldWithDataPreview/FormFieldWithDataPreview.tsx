import type { Schema } from '@formisch/react'
import type { ReactNode } from 'react'
import type { WithForm } from '../../model/FormTypes'
import { FormDataPreview } from '../../ui/FormDataPreview/FormDataPreview'
import styles from './FormFieldWithDataPreview.module.css'

interface PropsForFormFieldWithDataPreview<
	TSchema extends Schema,
> extends WithForm<TSchema> {
	children?: ReactNode
}

/** Shows a form field in a story, with the form's live values printed below it. */
export function FormFieldWithDataPreview<TSchema extends Schema>({
	form,
	children,
}: PropsForFormFieldWithDataPreview<TSchema>) {
	return (
		<div className={styles.formFieldWithDataPreview}>
			{children}
			<FormDataPreview form={form} />
		</div>
	)
}
