import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import '../01-atoms/ScreenPaddingAtom.lit'

/** The strip along the top of every page: the site's name, linking home. */
@customElement('app-header-organism')
export class HeaderOrganism extends LitElement {
	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			header {
				border-bottom: 2px solid var(--globalColor_teal900);
				background-color: var(--globalColor_teal100);
				padding: 0.5rem;
				color: black;
			}

			.layout {
				display: flex;
				width: 100%;
				align-items: center;
				justify-content: space-between;
				gap: 0.5rem;
			}

			@media not all and (min-width: 48rem) {
				.layout {
					flex-direction: column;
					justify-content: center;
				}
			}

			.homeLink {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}

			.siteName {
				font-size: 1.875rem;
				line-height: calc(2.25 / 1.875);
				font-weight: 800;
			}
		`,
	]

	override render() {
		return html`<header>
			<app-screen-padding-atom>
				<div class="layout">
					<a href="/" class="homeLink">
						<img src="/simplified-logo.png" alt="Logo" height="50" width="50" />
						<p class="siteName">The Meal Place</p>
					</a>
					<!-- TODO: MainNavMolecule goes here, with the links to the home,
					categories and contact pages. It needs the router to mark the
					current page, so it arrives with the pages in PR 4 of the Lit line. -->
				</div>
			</app-screen-padding-atom>
		</header>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-header-organism': HeaderOrganism
	}
}
