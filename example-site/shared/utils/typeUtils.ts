/**
 * A list that always holds at least one item.
 *
 * Spelled out as "one item, then any number more" so that TypeScript refuses an
 * empty list, which a plain `Array<T>` would accept.
 *
 * A form field's errors arrive in this shape: a field with nothing wrong has no
 * error list at all rather than an empty one. That is why a plain
 * `Array<string>` cannot be assigned where a field's errors are expected, and
 * why the example sites' error stories declare their sample list with this
 * type rather than letting it be inferred.
 */
export type OneOrMoreArray<T> = [T, ...Array<T>]
