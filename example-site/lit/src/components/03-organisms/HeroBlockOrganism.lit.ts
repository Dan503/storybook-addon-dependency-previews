import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import '../01-atoms/BgImageContainerAtom.lit'
import '../01-atoms/ScreenPaddingAtom.lit'

/**
 * The large opening block of a page: a title and a little text over a picture.
 *
 * @slot title - the heading, as text or as markup with links in it
 * @slot - the text under the heading
 */
@customElement('app-hero-block-organism')
export class HeroBlockOrganism extends LitElement {
	/** The picture behind the block. */
	@property() imgSrc = ''
	/** A description of the picture, for screen readers. */
	@property() altText = ''
	/**
	 * The colour of the wash over the picture. Left out, the picture
	 * container's own default applies.
	 */
	@property() tintColor?: string
	/**
	 * How strongly the wash covers the picture, from 0 to 100. Left out, the
	 * picture container's own default applies.
	 */
	@property({ type: Number }) tintPercent?: number

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			app-bg-image-container-atom {
				display: grid;
				width: 100%;
				min-height: 25rem;
				place-items: center;
				border-bottom: 2px solid var(--globalColor_teal900);
				text-align: center;
			}

			h1 {
				font-size: 2.25rem;
				line-height: calc(2.5 / 2.25);
				font-weight: 700;
			}
		`,
	]

	override render() {
		return html`<app-bg-image-container-atom
			class="HeroBlockOrganism"
			.imgSrc=${this.imgSrc}
			.altText=${this.altText}
			.tintColor=${this.tintColor}
			.tintPercent=${this.tintPercent}
		>
			<app-screen-padding-atom padVertical>
				<h1><slot name="title"></slot></h1>
				<slot></slot>
			</app-screen-padding-atom>
		</app-bg-image-container-atom>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-hero-block-organism': HeroBlockOrganism
	}
}
