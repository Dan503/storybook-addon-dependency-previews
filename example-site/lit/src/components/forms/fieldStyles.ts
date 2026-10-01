import { css } from 'lit'

/**
 * The look the text field and the text area share: the bold label above the
 * box, the box itself, its focus ring, and the red it turns when it has
 * errors. Each lists this after `baseStyles`, with its own rules after it.
 *
 * The box is marked with the `control` class, whether it is an `input` or a
 * `textarea`, and gains `hasErrors` while it has errors to show.
 */
export const fieldStyles = css`
	:host {
		display: block;
	}

	label {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.labelText {
		font-size: 1.25rem;
		line-height: calc(1.75 / 1.25);
		font-weight: 700;
	}

	.control {
		width: 100%;
		border: 1px solid var(--globalColor_gray300);
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
	}

	.control:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--globalColor_indigo500);
	}

	.control.hasErrors {
		border-color: var(--globalColor_red600);
		color: var(--globalColor_red900);
	}

	.control.hasErrors::placeholder {
		color: color-mix(in oklab, var(--globalColor_red900) 60%, transparent);
	}
`
