import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Meal } from 'example-site-shared/utils'
import { baseStyles } from '../../lib/baseStyles'
import '../03-organisms/SiteFrameOrganism.lit'
import '../03-organisms/HeroBlockOrganism.lit'
import '../01-atoms/ExternalLinkAtom.lit'
import '../01-atoms/ScreenPaddingAtom.lit'
import '../listings/card/CardListingOrganism.lit'
import { getMealCard } from '../listings/card/CardMolecule.lit'

/** The home page: a welcome over the first featured meal's picture, then the rest as cards. */
@customElement('app-home-template')
export class HomeTemplate extends LitElement {
	/** The meals to feature. The first one's picture goes behind the welcome; the rest are listed. */
	@property({ attribute: false }) featuredMeals: Array<Meal> = []

	static override styles = [
		baseStyles,
		css`
			:host {
				display: grid;
			}

			h2 {
				margin-bottom: 1rem;
				font-size: 1.5rem;
				line-height: calc(2 / 1.5);
				font-weight: 700;
			}
		`,
	]

	override render() {
		const [featureMeal, ...otherMeals] = this.featuredMeals
		return html`<app-site-frame-organism>
			<div class="HomeTemplate">
				<app-hero-block-organism .imgSrc=${featureMeal?.image ?? ''}>
					<span slot="title">
						Welcome to the
						<br />
						<app-external-link-atom
							href="https://github.com/Dan503/storybook-addon-dependency-previews"
						>
							Storybook Dependency Previews
						</app-external-link-atom>
						<br />
						example site
					</span>
					<p>
						This is an example site to demonstrate the dependency preview addon
						in a realistic environment.
					</p>
				</app-hero-block-organism>
				<app-screen-padding-atom padVertical>
					<h2>Featured meals:</h2>
					<app-card-listing-organism
						.cards=${otherMeals.map(getMealCard)}
					></app-card-listing-organism>
				</app-screen-padding-atom>
			</div>
		</app-site-frame-organism>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-home-template': HomeTemplate
	}
}
