'use strict'

// A single-pass CSS modules loader for webpack.
// Used by Angular's Storybook to handle *.module.css files from the addon
// without relying on style-loader (which causes a circular TDZ error in
// webpack 5 due to its ESM pitch output).
//
// This loader:
//   1. Parses class names from the raw CSS via regex
//   2. Generates a stable per-file hash to scope the names
//   3. Returns a CJS module that injects the scoped CSS into the DOM
//      and exports the { localName: scopedName } mapping

const crypto = require('crypto')

module.exports = function cssModulesLoader(source) {
	const hash = crypto
		.createHash('md5')
		.update(this.resourcePath)
		.digest('hex')
		.slice(0, 8)

	const classNames = {}
	// Match .className where the next char is not an alphanumeric/underscore/dash
	// (avoids matching pseudo-selectors like :hover inside attribute values etc.)
	const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)(?=[^a-zA-Z0-9_-]|$)/g
	let match
	while ((match = classRegex.exec(source)) !== null) {
		const local = match[1]
		if (!classNames[local]) {
			classNames[local] = `${local}_${hash}`
		}
	}

	let scopedCss = source
	for (const [local, scoped] of Object.entries(classNames)) {
		scopedCss = scopedCss.replace(
			new RegExp(`\\.${local}(?=[^a-zA-Z0-9_-]|$)`, 'g'),
			`.${scoped}`,
		)
	}

	return [
		'"use strict";',
		`var _id = ${JSON.stringify('css_' + hash)};`,
		'if (typeof document !== "undefined" && !document.getElementById(_id)) {',
		'  var _el = document.createElement("style");',
		'  _el.id = _id;',
		`  _el.textContent = ${JSON.stringify(scopedCss)};`,
		'  document.head.appendChild(_el);',
		'}',
		`module.exports = ${JSON.stringify(classNames)};`,
	].join('\n')
}
