'use strict'
/**
 * NOTE: This file is only needed because this example site imports from
 * `example-site-shared`, a cross-workspace TypeScript package that depends on
 * zod. In a normal Angular Storybook project you would not need this file.
 *
 * Minimal zod stub for Storybook — schema validation not needed at story render time.
 * Supports: z.object({...}), z.string(), z.email(), z.number(), .min(), .max(), etc.
 */
function makeSchema() {
	const handler = {
		get(_target, prop) {
			if (prop === 'parse') return (v) => v
			if (prop === 'safeParse') return (v) => ({ success: true, data: v })
			if (prop === '_def') return { typeName: 'ZodString' }
			return (..._args) => schemaProxy
		},
		apply() { return schemaProxy },
		construct() { return schemaProxy },
	}
	const schemaProxy = new Proxy(function () {}, handler)
	return schemaProxy
}
const schemaProxy = makeSchema()
const zHandler = {
	get(_target, prop) {
		if (prop === '__esModule') return false
		if (prop === 'default') return zProxy
		return (..._args) => schemaProxy
	},
}
const zProxy = new Proxy({}, zHandler)
module.exports = zProxy
module.exports.default = zProxy
module.exports.z = zProxy
// Named exports for `import * as z from 'zod'` (namespace import)
const zodMethods = [
	'object', 'string', 'number', 'boolean', 'array', 'enum', 'optional',
	'nullable', 'union', 'intersection', 'literal', 'tuple', 'record', 'map',
	'set', 'function', 'lazy', 'promise', 'any', 'unknown', 'never', 'void',
	'date', 'symbol', 'bigint', 'nan', 'null', 'undefined', 'coerce',
	'email', 'url', 'uuid', 'cuid', 'cuid2', 'ulid', 'ip',
]
zodMethods.forEach((m) => { module.exports[m] = (..._args) => schemaProxy })
