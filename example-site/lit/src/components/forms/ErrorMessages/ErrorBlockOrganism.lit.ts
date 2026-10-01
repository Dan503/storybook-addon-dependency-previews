import { LitElement, css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../../lib/baseStyles'
import type { FormErrors } from '../FormTypes'
import './ErrorListMolecule.lit'

/**
 * A red box above a form listing everything that needs fixing, announced to
 * screen readers as soon as it appears. It draws nothing when there are no
 * errors.
 */
@customElement('app-error-block-organism')
export class ErrorBlockOrganism extends LitElement {
	/** The messages to list. */
	@property({ attribute: false }) errors: FormErrors = null

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			.box {
				border-radius: 0.75rem;
				background-color: var(--globalColor_red100);
				padding: 0.5rem 1rem 0;
			}

			h2 {
				border-bottom: 2px solid var(--globalColor_red800);
				padding-bottom: 0.25rem;
				font-size: 1.5rem;
				line-height: calc(2 / 1.5);
				font-weight: 700;
			}

			.list {
				padding: 0.75rem 0 1rem;
			}
		`,
	]

	override render() {
		if (!this.errors?.length) {
			return nothing
		}
		// An h2, because the page the form sits on has its own h1.
		return html`<div role="alert" class="ErrorBlockOrganism">
			<div class="box">
				<h2>Please resolve the following errors</h2>
				<div class="list">
					<app-error-list-molecule
						.errors=${this.errors}
					></app-error-list-molecule>
				</div>
			</div>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-error-block-organism': ErrorBlockOrganism
	}
}
