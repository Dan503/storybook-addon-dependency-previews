import { LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getIconSvg, iconStyles } from './iconSvg'

/** A box with an arrow leaving it, for links that open another site. */
@customElement('app-external-link-icon')
export class ExternalLinkIcon extends LitElement {
	/** What a screen reader announces. Left out, the icon is hidden from them. */
	@property() altText?: string

	static override styles = iconStyles

	override render() {
		return getIconSvg(
			this.altText,
			svg`<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
			/>`,
		)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-external-link-icon': ExternalLinkIcon
	}
}
