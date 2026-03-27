'use strict'

// Global CSS loader for Angular Storybook + Tailwind v4.
// Handles src/styles.css when @storybook/angular's webpack setup has no loaders
// configured for the ?ngGlobalStyle resource query. Runs PostCSS
// (@tailwindcss/postcss) on the raw CSS and injects it as a <style> tag via
// CJS output, following the same pattern as css-modules-loader.cjs to avoid
// style-loader's circular TDZ error in webpack 5.

const crypto = require('crypto')
const postcss = require('postcss')
const tailwindPlugin = require('@tailwindcss/postcss')

module.exports = async function globalCssLoader(source) {
	const callback = this.async()
	try {
		const result = await postcss([tailwindPlugin]).process(source, {
			from: this.resourcePath,
		})
		for (const msg of result.messages) {
			if (msg.type === 'dependency' && msg.file) {
				this.addDependency(msg.file)
			} else if (msg.type === 'dir-dependency' && msg.dir) {
				this.addContextDependency(msg.dir)
			}
		}
		const hash = crypto
			.createHash('md5')
			.update(this.resourcePath)
			.digest('hex')
			.slice(0, 8)
		const id = JSON.stringify('global_css_' + hash)
		const css = JSON.stringify(result.css)
		callback(
			null,
			[
				'"use strict";',
				`var _id = ${id};`,
				'if (typeof document !== "undefined" && !document.getElementById(_id)) {',
				'  var _el = document.createElement("style");',
				'  _el.id = _id;',
				`  _el.textContent = ${css};`,
				'  document.head.appendChild(_el);',
				'}',
				'module.exports = {};',
			].join('\n'),
		)
	} catch (/** @type {any} */ err) {
		callback(err)
	}
}
