import * as v from 'valibot'

/** What is wrong with each field of a form, by field name. */
export type FieldErrors<TSchema extends v.GenericSchema> = NonNullable<
	v.FlatErrors<TSchema>['nested']
>

/**
 * Checks form values against a schema and lists what is wrong with each field,
 * by field name. A field with nothing wrong is left out, and so is every field
 * when the values pass.
 *
 * @param schema - the rules the values must meet
 * @param values - the values as they stand, typed or not yet
 */
export function getFieldErrors<TSchema extends v.GenericSchema>(
	schema: TSchema,
	values: v.InferInput<TSchema>,
): FieldErrors<TSchema> {
	// Every field of the list is optional, so an empty one is a list with
	// nothing wrong. TypeScript cannot work that out while the schema is not
	// yet known, hence the `as`.
	const noErrors = {} as FieldErrors<TSchema>
	const result = v.safeParse(schema, values)
	if (result.success) {
		return noErrors
	}
	return v.flatten<TSchema>(result.issues).nested ?? noErrors
}
