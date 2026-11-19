import type {
	FieldStore,
	FormStore,
	RequiredPath,
	Schema,
} from '@formisch/react'

export interface WithField<TSchema extends Schema, TPath extends RequiredPath> {
	field: FieldStore<TSchema, TPath>
}

export interface WithForm<TSchema extends Schema> {
	form: FormStore<TSchema>
}

export type FormErrors = FieldStore['errors'] | Array<Error>
