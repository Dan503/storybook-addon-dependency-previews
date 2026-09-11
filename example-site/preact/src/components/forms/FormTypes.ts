import type {
	FieldStore,
	FormStore,
	FormSchema,
	RequiredPath,
} from '@formisch/preact'

export interface WithField<
	TSchema extends FormSchema,
	TPath extends RequiredPath,
> {
	field: FieldStore<TSchema, TPath>
}

export interface WithForm<TSchema extends FormSchema> {
	form: FormStore<TSchema>
}

/**
 * The errors a form or one field can be showing, in the shape the error
 * components take.
 *
 * Read through `['value']` because Formisch's Preact build hands a field's
 * errors over as a signal — a small box holding a value that tells the page to
 * redraw when it changes — and what the error components want is what is
 * inside the box. The whole-form reader, `getDeepErrors`, already hands back
 * the value rather than the box, so both fit this.
 *
 * `Array<Error>` is here for the stories, which pass errors they made up
 * themselves rather than any the form produced.
 */
export type FormErrors = FieldStore['errors']['value'] | Array<Error>
