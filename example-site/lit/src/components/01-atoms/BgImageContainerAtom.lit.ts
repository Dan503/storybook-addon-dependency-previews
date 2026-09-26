import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { baseStyles } from '../../lib/baseStyles'

/** The wash's colour when none is given. */
const defaultTintColor = 'white'
/** How strongly the wash covers the picture when no strength is given. */
const defaultTintPercent = 70

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
	/**
	 * The colour of the wash over the picture. Left out, or handed on empty by a
	 * parent that was given none, `defaultTintColor` above applies.
	 */
	@property() tintColor?: string
	/**
	 * How strongly the wash covers the picture, from 0 to 100. Left out, or
	 * handed on empty, `defaultTintPercent` above applies.
	 */
	@property({ type: Number }) tintPercent?: number

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
		const tintPercent = this.tintPercent ?? defaultTintPercent
		const tintStyle = {
			backgroundColor: this.tintColor ?? defaultTintColor,
			opacity: `${tintPercent}%`,
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
