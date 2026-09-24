import { html, render } from 'lit'
import './components/03-organisms/SiteFrameOrganism.lit'
import './components/01-atoms/ScreenPaddingAtom.lit'
import './app.css'

const appRoot = document.getElementById('app')

// TODO: the router goes here, drawing the page that matches the address inside
// the site frame. It arrives with the pages in PR 4 of the Lit line; until then
// the frame is drawn with a note in the middle.
if (appRoot) {
	render(
		html`<app-site-frame-organism>
			<app-screen-padding-atom padVertical>
				<p>The pages of this site are on their way.</p>
			</app-screen-padding-atom>
		</app-site-frame-organism>`,
		appRoot,
	)
}
