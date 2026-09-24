import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { baseStyles } from '../../lib/baseStyles'

/**
 * Lays content over a picture that fills the space behind it, with a coloured
 * wash between the two so the content stays readable.
 *
 * @slot - the content to lay over the picture
 */
@customElement('app-bg-image-container-atom')
export class BgImageContainerAtom extends LitElement {
	/** The picture to fill the background with. */
	@property() imgSrc = ''
	/** A description of the picture, for screen readers. */
	@property() altText = ''
	/** The colour of the wash over the picture. */
	@property() tintColor = 'white'
	/** How strongly the wash covers the picture, from 0 to 100. */
	@property({ type: Number }) tintPercent = 70

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
				position: relative;
			}

			.fill {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			img {
				object-fit: cover;
			}

			.content {
				position: relative;
				z-index: var(--globalZIndex_bgImageContent);
				display: grid;
			}
		`,
	]

	override render() {
		const tintStyle = {
			backgroundColor: this.tintColor,
			opacity: `${this.tintPercent}%`,
		}
		return html`
			<img src=${this.imgSrc} alt=${this.altText} class="fill" />
			<div class="fill" style=${styleMap(tintStyle)}></div>
			<div class="content"><slot></slot></div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-bg-image-container-atom': BgImageContainerAtom
	}
}
