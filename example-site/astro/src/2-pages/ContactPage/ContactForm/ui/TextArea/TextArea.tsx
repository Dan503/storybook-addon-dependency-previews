import { useId } from 'react'
import type { RequiredPath, Schema } from '@formisch/react'
import type { WithField } from '../../model/FormTypes'
import { ErrorList } from '../ErrorMessages/ErrorList'
import fieldStyles from '../field.module.css'
import styles from './TextArea.module.css'

export interface PropsForTextArea {
	label: string
	placeholder?: string
}

export type FieldPropsForTextArea<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextArea & WithField<TSchema, TPath>

/** A labelled text area that grows taller as its text gets longer. */
export function TextArea<TSchema extends Schema, TPath extends RequiredPath>({
	label,
	placeholder,
	field,
}: FieldPropsForTextArea<TSchema, TPath>) {
	const id = useId()
	const typedText = (field.input as string | undefined) ?? ''
	// The extra space gives a last empty line its height.
	const sizerText = `${typedText} `

	return (
		<div>
			<label htmlFor={id} className={fieldStyles.label}>
				<span className={fieldStyles.labelText}>{label}</span>
				{/* The text area and an invisible copy of its text share one grid
				cell, so the copy's height stretches the text area to fit the text. */}
				<div className={styles.growWrapper}>
					<textarea
						{...field.props}
						value={typedText}
						id={id}
						placeholder={placeholder}
						aria-invalid={!!field.errors}
						className={fieldStyles.input}
					/>
					<span aria-hidden className={`${fieldStyles.input} ${styles.sizer}`}>
						{sizerText}
					</span>
				</div>
			</label>
			{field.errors && <ErrorList errors={field.errors} />}
		</div>
	)
}
