import { css } from 'lit'

/**
 * The starting point every component's own styles are written on top of.
 *
 * The sibling sites get this from Tailwind, which clears the browser's default
 * margins, heading sizes, list bullets and link colours for the whole page
 * before any component is styled. A stylesheet loaded for the page does not
 * reach inside a component here, so each one starts from the browser's defaults
 * instead, and the same markup would come out with gaps and underlines the
 * other sites do not have.
 *
 * So a component that draws headings, paragraphs, lists, links, pictures,
 * buttons, form fields or code lists this first in its `static styles`, and its
 * own rules follow.
 * The rules are Tailwind's own, copied from its `preflight.css`, and only the
 * ones that touch an element these components draw — a rule for an element
 * nobody here uses would be one more thing to keep in step for nothing.
 * Lit shares one copy of it between every component that lists it.
 *
 * The first rule names the plain elements it clears rather than using `*` as
 * Tailwind does, because `*` would also match the tags of the components drawn
 * inside, and a rule from outside a component beats the component's own rules
 * for itself. Every nested component would lose its padding.
 */
export const baseStyles = css`
	div,
	span,
	header,
	p,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	ul,
	li,
	a,
	img,
	svg,
	button,
	form,
	label,
	input,
	textarea,
	pre,
	code {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border: 0 solid;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-size: inherit;
		font-weight: inherit;
	}

	a {
		color: inherit;
		text-decoration: inherit;
	}

	ul {
		list-style: none;
	}

	img,
	svg {
		display: block;
	}

	img {
		max-width: 100%;
		height: auto;
	}

	button,
	input,
	textarea {
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
		border-radius: 0;
		background-color: transparent;
		opacity: 1;
	}

	::placeholder {
		opacity: 1;
	}

	/* Tailwind leaves this out for older Safari, which crashes on it. */
	@supports (not (-webkit-appearance: -apple-pay-button)) or
		(contain-intrinsic-size: 1px) {
		::placeholder {
			color: color-mix(in oklab, currentcolor 50%, transparent);
		}
	}

	textarea {
		resize: vertical;
	}

	/* The page's own code rule in app.css does not reach in here, so the same
	   monospace fonts are named again. */
	pre,
	code {
		font-family:
			source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
		font-size: 1em;
	}
`
