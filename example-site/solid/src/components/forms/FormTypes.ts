import type {
	FieldStore,
	FormStore,
	RequiredPath,
	FormSchema,
} from '@formisch/solid'

export interface WithField<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
> {
	field: FieldStore<TSchema, TPath>
}

export interface WithForm<TSchema extends FormSchema> {
	form: FormStore<TSchema>
}

export type FormErrors = FieldStore['errors'] | Array<Error>
