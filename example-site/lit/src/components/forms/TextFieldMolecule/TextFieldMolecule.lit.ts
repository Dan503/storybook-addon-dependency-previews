import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { baseStyles } from '../../../lib/baseStyles'
import { fieldStyles } from '../fieldStyles'
import type { FormErrors } from '../FormTypes'
import '../ErrorMessages/ErrorListMolecule.lit'

/**
 * A one-line text box with its label above it and its errors below it.
 *
 * The label is drawn here, beside the box, because a label only works for a
 * box inside the same component. The browser's `input` event reaches whoever
 * is listening outside, and `value` is already up to date by then, so a form
 * reads the new value from this element.
 *
 * A form outside cannot be sent from a box inside this component, so pressing
 * Enter in it calls `onSubmit` instead.
 */
@customElement('app-text-field-molecule')
export class TextFieldMolecule extends LitElement {
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
	/** Runs when Enter is pressed in the box, to send the form. */
	@property({ attribute: false }) onSubmit?: (event: KeyboardEvent) => void

	static override styles = [baseStyles, fieldStyles]

	override render() {
		const hasErrors = Boolean(this.errors?.length)
		return html`<div class="TextFieldMolecule">
			<label for="input">
				<span class="labelText">${this.label}</span>
				<input
					id="input"
					class=${classMap({ control: true, hasErrors })}
					name=${this.name}
					placeholder=${this.placeholder}
					.value=${this.value}
					@input=${this._onInput}
					@keyup=${this._onKeyUp}
				/>
			</label>
			<app-error-list-molecule .errors=${this.errors}></app-error-list-molecule>
		</div>`
	}

	private _onInput(event: InputEvent) {
		this.value = (event.target as HTMLInputElement).value
	}

	private _onKeyUp(event: KeyboardEvent) {
		if (event.key !== 'Enter') {
			return
		}
		this.onSubmit?.(event)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-text-field-molecule': TextFieldMolecule
	}
}
