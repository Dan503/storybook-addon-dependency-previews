import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
	getFullAddressViaColons,
	type ColonRouteTemplate,
	type HrefParams,
	type LinkAddressPropsViaColons,
} from 'example-site-shared/utils'
import { baseStyles } from '../../../lib/baseStyles'

/**
 * The address is optional — without one the item draws as plain content rather
 * than a link. Addresses outside this site belong in `ExternalLinkAtom`.
 */
export type PropsForCompactListingMolecule = {
	imageSrc: string
	title: string
	description: string
} & Partial<LinkAddressPropsViaColons>

/** One small item in a list: a little picture beside a title and a line of text. */
@customElement('app-compact-listing-molecule')
export class CompactListingMolecule extends LitElement {
	/** The small picture at the front. */
	@property() imageSrc = ''
	/**
	 * The item's heading.
	 *
	 * Named `title` to match the item data every site shares, which means it
	 * stands in for the browser's own `title` — the one that shows a tooltip.
	 * Set it as a property, as every use here does: written as an attribute it
	 * would bring the tooltip back as well.
	 */
	@property() override title = ''
	/** The line under the heading. */
	@property() description = ''
	/**
	 * The page the item links to, with `:name` marking each piece that changes.
	 * Left out, the item is not a link.
	 */
	@property() href?: ColonRouteTemplate
	/** The pieces that complete `href`, by name. */
	@property({ attribute: false }) hrefParams?: HrefParams

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			a {
				display: block;
			}

			.content {
				display: grid;
				grid-template-columns: auto 1fr;
				align-items: center;
				gap: 1rem;
			}

			img {
				height: 3.75rem;
			}

			h3 {
				font-size: 1.25rem;
				line-height: 1;
				font-weight: 700;
			}
		`,
	]

	override render() {
		if (!this.href) return this._renderItemContent()
		const fullAddress = getFullAddressViaColons({
			href: this.href,
			hrefParams: this.hrefParams,
		})
		return html`<a href=${fullAddress}>${this._renderItemContent()}</a>`
	}

	/**
	 * Draws the picture and words of the item, without the link around them.
	 * Written once so the linked and plain forms cannot drift apart.
	 */
	private _renderItemContent() {
		return html`<div class="content">
			<img src=${this.imageSrc} alt="" />
			<div>
				<h3>${this.title}</h3>
				<p>${this.description}</p>
			</div>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-compact-listing-molecule': CompactListingMolecule
	}
}
