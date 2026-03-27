'use strict'
/**
 * NOTE: This file is only needed because this example site imports from
 * `example-site-shared`, a cross-workspace TypeScript package that depends on
 * axios. In a normal Angular Storybook project you would not need this file.
 *
 * Minimal axios stub for Storybook — no real HTTP needed.
 * Must satisfy: axios.defaults.transformResponse (iterable) and axios.create()
 */
const transformResponse = [
	(data) => {
		if (typeof data === 'string') {
			try { return JSON.parse(data) } catch (e) { return data }
		}
		return data
	},
]
const mockRequest = (config) =>
	Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })
const instance = Object.assign(mockRequest, {
	get: mockRequest,
	post: mockRequest,
	put: mockRequest,
	delete: mockRequest,
	patch: mockRequest,
	head: mockRequest,
	defaults: { transformResponse, headers: {}, baseURL: '' },
	interceptors: {
		request: { use: () => 0, eject: () => {} },
		response: { use: () => 0, eject: () => {} },
	},
	create: () => instance,
})
module.exports = instance
module.exports.default = instance
module.exports.create = instance.create
module.exports.defaults = instance.defaults
