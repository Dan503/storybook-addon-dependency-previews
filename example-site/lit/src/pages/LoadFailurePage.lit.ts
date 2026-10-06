import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { setPageTitle } from '../lib/pageTitle'
import { messagePageStyles, renderMessagePage } from './messagePage'
import '../components/01-atoms/ButtonAtom.lit'

/**
 * Shown in place of a page that could not get its meals, because the meal
 * database did not answer.
 *
 * Every page that asks the meal database can end up here, the home page
 * included. The failure is remembered until "Try again" is pressed, so going
 * away and coming back shows this again, with the same button.
 */
@customElement('app-load-failure-page')
export class LoadFailurePage extends LitElement {
	/** What to do when the reader asks to try again. */
	@property({ attribute: false }) onTryAgain?: () => void

	static override styles = messagePageStyles

	override render() {
		setPageTitle('Something went wrong | The Meal Place')
		return renderMessagePage(
			html`<h1>We could not load the meals</h1>
				<p>
					The meal database did not answer. It may be down, or your connection
					may have dropped.
				</p>
				<app-button-atom .onClick=${this.onTryAgain}
					>Try again</app-button-atom
				>`,
		)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-load-failure-page': LoadFailurePage
	}
}
