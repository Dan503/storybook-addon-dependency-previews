import { readOutPageTitleOnceFinal } from './pageTitle'
import { recordOpeningPageReplaced } from './useFetchedData'

/**
 * Runs after the page on screen has been replaced without a reload — a move to
 * another page, the failure page appearing or going, or Try again — and does
 * what SvelteKit does at the same moment: puts focus at the start of the page
 * and reads the new page's title out once it is final. It also notes that the
 * page the site opened on is gone, so later pages draw their loading view
 * while they wait.
 *
 * Focus needs moving because the link or button that held it was removed with
 * the old page. The browser then carried on from a point after the new page's
 * content, so the next Tab skipped the whole page and went to whatever comes
 * after it — Netlify's badge on the deployed site, then the browser's own
 * controls.
 */
export function handlePageReplaced() {
	recordOpeningPageReplaced()
	moveFocusToPageStart()
	readOutPageTitleOnceFinal()
}

/**
 * Focuses the page body, so the next Tab starts from the top of the page, as
 * after a full reload. Copied from SvelteKit: the body is made focusable just
 * long enough to take focus, then put back as it was.
 */
function moveFocusToPageStart() {
	const { body } = document
	const tabIndexBefore = body.getAttribute('tabindex')
	// `focusVisible: false` keeps the browser from drawing a focus outline
	// around the whole page. The DOM types in this TypeScript version do not
	// list it yet, so the type is widened here.
	const focusOptions: FocusOptions & { focusVisible?: boolean } = {
		preventScroll: true,
		focusVisible: false,
	}

	body.tabIndex = -1
	body.focus(focusOptions)

	if (tabIndexBefore === null) {
		body.removeAttribute('tabindex')
	} else {
		body.setAttribute('tabindex', tabIndexBefore)
	}
}
