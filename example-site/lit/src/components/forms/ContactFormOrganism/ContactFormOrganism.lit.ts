import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import * as v from 'valibot'
import {
	contactFormSchema,
	defaultContactFormValues,
	type ContactFormInputData,
	type ContactFormOutputData,
} from 'example-site-shared/data'
import { baseStyles } from '../../../lib/baseStyles'
import { getFieldErrors } from '../getFieldErrors'
import type { TextFieldMolecule } from '../TextFieldMolecule/TextFieldMolecule.lit'
import type { TextAreaMolecule } from '../TextAreaMolecule/TextAreaMolecule.lit'
import '../TextFieldMolecule/TextFieldMolecule.lit'
import '../TextAreaMolecule/TextAreaMolecule.lit'
import '../ErrorMessages/ErrorBlockOrganism.lit'
import '../../01-atoms/ButtonAtom.lit'

type ContactFormFieldName = keyof ContactFormInputData

/**
 * Says whether a field's name is one of the contact form's own.
 *
 * @param name - the name the field was given
 */
function checkIsContactFormFieldName(
	name: string,
): name is ContactFormFieldName {
	return Object.hasOwn(defaultContactFormValues, name)
}

/**
 * The contact form: name, email and message, with every error listed in a
 * block above the fields and each field's own errors beneath it.
 *
 * The values are kept here rather than read from the browser's form, because a
 * form cannot see a box inside another component. Each field reports its typing
 * through the browser's own `input` event, which is heard here.
 *
 * Nothing is checked until the first attempt to send. After that the values
 * are checked again on every change, so an error clears as soon as it is fixed.
 */
@customElement('app-contact-form-organism')
export class ContactFormOrganism extends LitElement {
	/** What is typed in each field. */
	@property({ attribute: false }) values: ContactFormInputData = {
		...defaultContactFormValues,
	}
	/** Runs with the values once they pass the checks and the form is sent. */
	@property({ attribute: false }) onSubmit?: (
		values: ContactFormOutputData,
	) => void
	/** Whether to check the values from the first draw, so errors show at once. */
	@property({ type: Boolean }) shouldShowErrorsFromStart = false

	@state() private _hasTriedToSend = false

	/**
	 * Checks the values, and hands them to `onSubmit` when they pass.
	 *
	 * Written as an arrow function so it still knows which form it belongs to
	 * when the button or a field calls it. It runs on a click on Send and on
	 * Enter in a one-line field. It is also the form's own submit handler, but
	 * nothing in the form can submit it today: the button and the boxes sit
	 * inside other components, where they cannot reach it.
	 */
	private _send = (event: Event) => {
		event.preventDefault()
		this._hasTriedToSend = true
		const result = v.safeParse(contactFormSchema, this.values)
		if (result.success) {
			this.onSubmit?.(result.output)
		}
	}

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			.ContactFormOrganism,
			form {
				display: grid;
				gap: 1rem;
			}

			.actions {
				display: flex;
				justify-content: flex-end;
			}
		`,
	]

	override render() {
		const isChecking = this.shouldShowErrorsFromStart || this._hasTriedToSend
		const fieldErrors = isChecking
			? getFieldErrors(contactFormSchema, this.values)
			: {}
		const allErrors = Object.values(fieldErrors).flat()
		// Left out entirely when there are no errors: an empty block would still
		// take a place in the grid, and the gap above the fields with it.
		const errorBlock = allErrors.length
			? html`<app-error-block-organism
					.errors=${allErrors}
				></app-error-block-organism>`
			: nothing
		return html`<div class="ContactFormOrganism">
			${errorBlock}
			<form @submit=${this._send} @input=${this._onFieldInput}>
				<app-text-field-molecule
					name="name"
					label="Name"
					placeholder="Your name"
					.value=${this.values.name}
					.errors=${fieldErrors.name ?? null}
					.onSubmit=${this._send}
				></app-text-field-molecule>
				<app-text-field-molecule
					name="email"
					label="Email"
					placeholder="example@email.com"
					.value=${this.values.email}
					.errors=${fieldErrors.email ?? null}
					.onSubmit=${this._send}
				></app-text-field-molecule>
				<app-text-area-molecule
					name="message"
					label="Message"
					placeholder="Type your message here..."
					.value=${this.values.message}
					.errors=${fieldErrors.message ?? null}
				></app-text-area-molecule>
				<div class="actions">
					<app-button-atom .onClick=${this._send}>Send</app-button-atom>
				</div>
			</form>
		</div>`
	}

	/**
	 * Records what was typed in a field. The event is heard here from outside
	 * the field, so it arrives from the field itself, whose `value` is already
	 * up to date.
	 */
	private _onFieldInput(event: Event) {
		const field = event.target as TextFieldMolecule | TextAreaMolecule
		if (!checkIsContactFormFieldName(field.name)) {
			return
		}
		this.values = { ...this.values, [field.name]: field.value }
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-contact-form-organism': ContactFormOrganism
	}
}
