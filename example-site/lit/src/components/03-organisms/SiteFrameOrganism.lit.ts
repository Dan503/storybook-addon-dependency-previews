import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './HeaderOrganism.lit'
import './FooterOrganism.lit'

/**
 * The header and footer every page sits between. The page fills the space
 * between them, so the footer stays at the bottom of the screen however short
 * the page is.
 *
 * @slot - the page
 */
@customElement('app-site-frame-organism')
export class SiteFrameOrganism extends LitElement {
	static override styles = css`
		:host {
			display: grid;
			min-height: 100%;
			grid-template-rows: auto 1fr auto;
		}

		.page {
			display: grid;
		}
	`

	override render() {
		return html`
			<app-header-organism></app-header-organism>
			<div class="page"><slot></slot></div>
			<app-footer-organism></app-footer-organism>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-site-frame-organism': SiteFrameOrganism
	}
}
