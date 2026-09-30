import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { baseStyles } from '../../../lib/baseStyles'
import { fieldStyles } from '../fieldStyles'
import type { FormErrors } from '../FormTypes'
import '../ErrorMessages/ErrorListMolecule.lit'

/**
 * A text box for several lines, with its label above it and its errors below
 * it. The box grows taller as more is typed, rather than scrolling.
 *
 * The label is drawn here, beside the box, because a label only works for a
 * box inside the same component. The browser's `input` event reaches whoever
 * is listening outside, and `value` is already up to date by then, so a form
 * reads the new value from this element.
 */
@customElement('app-text-area-molecule')
export class TextAreaMolecule extends LitElement {
	/** The field's name, which a form uses to tell its fields apart. */
	@property() name = ''
	/** The words above the box. */
	@property() label = ''
	/** The hint shown in the box while it is empty. */
	@property() placeholder = ''
	/** What is typed in the box. */
	@property() value = ''
	/** The errors to show below the box. */
	@property({ attribute: false }) errors: FormErrors = null

	static override styles = [
		baseStyles,
		fieldStyles,
		css`
			/* The box and a hidden copy of its text share one grid cell. The copy
			   is as tall as the text, and the cell stretches the box to match.
			   minmax(0, 1fr) stops a long word widening the column. */
			.grower {
				display: grid;
				grid-template-columns: minmax(0, 1fr);
			}

			textarea,
			.textCopy {
				grid-column: 1;
				grid-row: 1;
				min-width: 0;
			}

			textarea {
				resize: none;
				overflow: hidden;
			}

			.textCopy {
				pointer-events: none;
				visibility: hidden;
				overflow: hidden;
				padding: 0.5rem 1rem;
				overflow-wrap: break-word;
				white-space: pre-wrap;
			}

			/* Gives a new last line its height before anything is typed on it. */
			.textCopy::after {
				content: ' ';
			}
		`,
	]

	override render() {
		const hasErrors = Boolean(this.errors?.length)
		const copiedText = this.value || this.placeholder || ' '
		return html`<div class="TextAreaMolecule">
			<label for="input">
				<span class="labelText">${this.label}</span>
				<div class="grower">
					<textarea
						id="input"
						class=${classMap({ control: true, hasErrors })}
						name=${this.name}
						placeholder=${this.placeholder}
						.value=${this.value}
						@input=${this._onInput}
					></textarea>
					<span class="textCopy">${copiedText}</span>
				</div>
			</label>
			<app-error-list-molecule .errors=${this.errors}></app-error-list-molecule>
		</div>`
	}

	private _onInput(event: InputEvent) {
		this.value = (event.target as HTMLTextAreaElement).value
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-text-area-molecule': TextAreaMolecule
	}
}
