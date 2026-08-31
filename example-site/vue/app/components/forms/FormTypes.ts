import type { FieldStore, FormStore, RequiredPath, Schema } from '@formisch/vue'

export interface WithField<TSchema extends Schema, TPath extends RequiredPath> {
	field: FieldStore<TSchema, TPath>
}

export interface WithForm<TSchema extends Schema> {
	form: FormStore<TSchema>
}

export type FormErrors = Array<string> | Array<Error> | null
