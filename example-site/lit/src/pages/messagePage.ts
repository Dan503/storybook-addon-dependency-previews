import { css, html, type TemplateResult } from 'lit'
import { baseStyles } from '../lib/baseStyles'
import { gridHostStyles } from '../lib/gridHostStyles'
import '../components/03-organisms/SiteFrameOrganism.lit'
import '../components/01-atoms/ContentRestraintAtom.lit'

/*
 * The layout shared by the pages that carry a short message rather than meals:
 * the not-found page and the load-failure page. Each page includes the styles
 * in its own, since styles do not reach into another element's shadow root.
 */

/** The styles `renderMessagePage` needs, for the page drawing it to include. */
export const messagePageStyles = [
	baseStyles,
	gridHostStyles,
	css`
		.centred {
			display: grid;
			place-items: center;
			height: 100%;
		}

		.message {
			display: grid;
			justify-items: start;
			gap: 1rem;
		}

		h1 {
			font-size: 1.875rem;
			line-height: calc(2.25 / 1.875);
			font-weight: 700;
		}

		a {
			color: var(--globalColor_teal700);
			text-decoration-line: underline;
		}

		a:hover {
			color: var(--globalColor_teal900);
		}
	`,
]

/**
 * Draws a message in the middle of the site frame.
 *
 * @param message - the heading, text and whatever the reader can do next
 */
export function renderMessagePage(message: TemplateResult) {
	return html`<app-site-frame-organism>
		<div class="centred">
			<app-content-restraint-atom padVertical>
				<div class="message">${message}</div>
			</app-content-restraint-atom>
		</div>
	</app-site-frame-organism>`
}
