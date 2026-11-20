import { useId } from 'react'
import type { RequiredPath, Schema } from '@formisch/react'
import type { WithField } from '../../model/FormTypes'
import { ErrorList } from '../ErrorMessages/ErrorList'
import fieldStyles from '../field.module.css'

export interface PropsForTextField {
	/** The field's label. */
	label: string
	/** Hint text shown in the box while it is empty. */
	placeholder?: string
}

export type FieldPropsForTextField<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextField & WithField<TSchema, TPath>

/** A labelled one-line text box, with the field's errors listed under it. */
export function TextField<TSchema extends Schema, TPath extends RequiredPath>({
	label,
	placeholder,
	field,
}: FieldPropsForTextField<TSchema, TPath>) {
	const id = useId()
	const typedText = (field.input as string | undefined) ?? ''

	return (
		<div>
			<label htmlFor={id} className={fieldStyles.label}>
				<span className={fieldStyles.labelText}>{label}</span>
				<input
					{...field.props}
					value={typedText}
					id={id}
					placeholder={placeholder}
					aria-invalid={!!field.errors}
					className={fieldStyles.input}
				/>
			</label>
			{field.errors && <ErrorList errors={field.errors} />}
		</div>
	)
}
