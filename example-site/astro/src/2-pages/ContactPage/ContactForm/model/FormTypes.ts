import type {
	FieldStore,
	FormStore,
	RequiredPath,
	Schema,
} from '@formisch/react'

export interface WithField<TSchema extends Schema, TPath extends RequiredPath> {
	/** The form field this shows: its current value and errors. */
	field: FieldStore<TSchema, TPath>
}

export interface WithForm<TSchema extends Schema> {
	/** The form's current values and errors. */
	form: FormStore<TSchema>
}

export type FormErrors = FieldStore['errors'] | Array<Error>
