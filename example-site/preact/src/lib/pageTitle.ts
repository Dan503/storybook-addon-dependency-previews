const pageTitleAnnouncerId = 'page-title-announcer'
// Copied from SvelteKit's own announcer: hidden from sight but not from screen
// readers. Written out here rather than as Tailwind's `sr-only` class, so it
// does not depend on Tailwind finding a class name inside a string in a
// `.ts` file.
const visuallyHiddenStyle =
	'position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px'

let titleForPageBeingBuilt = ''
let isPageTitleStandIn = false
let isTitleReadOutOwed = false

/**
 * Names the page — for the browser tab, and for the file the build writes out.
 *
 * Called while the page draws rather than from an effect, for two reasons.
 * Effects do not run while the pages are being built, and the title has to be
 * known by then; and a page here can pause part-way through drawing to wait for
 * its meals, which would make the number of effects differ between the paused
 * draw and the finished one. Setting a title twice does nothing, so a page
 * drawing more than once costs nothing.
 *
 * If the page on screen was replaced while it still had a stand-in title, the
 * read-out was put off until now — see `readOutPageTitleOnceFinal`.
 *
 * @param title - what the tab should read
 */
export function setPageTitle(title: string) {
	applyPageTitle(title)
	isPageTitleStandIn = false
	if (isTitleReadOutOwed) readOutPageTitleOnceFinal()
}

/** Writes the title to the browser tab, and keeps it for the build. */
function applyPageTitle(title: string) {
	titleForPageBeingBuilt = title
	// There is no browser tab to name while the pages are being built.
	if (typeof document !== 'undefined') {
		document.title = title
	}
}

/**
 * Has screen readers read out the page's title — now, if it is the page's real
 * one, or as soon as the page sets its real one with `setPageTitle`.
 *
 * Called once the page on screen has been replaced. Waiting for the real title
 * means a meal page still loading does not read out its stand-in and then the
 * meal's name a moment later: only the meal's name is read.
 */
export function readOutPageTitleOnceFinal() {
	if (isPageTitleStandIn) {
		isTitleReadOutOwed = true
		return
	}
	isTitleReadOutOwed = false
	readOutPageTitle()
}

/**
 * Writes the title into the hidden area `addPageTitleAnnouncer` adds, which
 * screen readers read out as soon as its text changes. Text the same as what
 * is already there is not read again.
 */
function readOutPageTitle() {
	if (typeof document === 'undefined') return
	const announcer = document.getElementById(pageTitleAnnouncerId)
	if (announcer) announcer.textContent = document.title || 'untitled page'
}

/**
 * Names the page with a placeholder until its real title is known — the meal
 * page uses it while its meal is on its way, since the title is the meal's
 * name. A placeholder is never read out.
 *
 * @param title - what the tab should read in the meantime
 */
export function setStandInPageTitle(title: string) {
	applyPageTitle(title)
	isPageTitleStandIn = true
}

/**
 * The title the page that has just been drawn asked for.
 *
 * Read by the `prerender` export in `src/index.tsx` once a page has finished
 * drawing, so the written-out file carries that page's own title rather than
 * the one in `index.html`. Pages are built one at a time, so what this holds is
 * always the page just finished.
 */
export function getTitleForPageBeingBuilt(): string {
	return titleForPageBeingBuilt
}

/**
 * Adds the empty hidden area screen readers read the page title from, the
 * same as SvelteKit's. Called once in the browser, before the site is drawn.
 *
 * It sits on `<body>` outside the site's own element, so the page the build
 * wrote and the browser's first draw of it still match. It starts empty, so
 * nothing is read on the first load — screen readers announce a freshly loaded
 * page by themselves.
 */
export function addPageTitleAnnouncer() {
	const announcer = document.createElement('div')
	announcer.id = pageTitleAnnouncerId
	announcer.setAttribute('aria-live', 'assertive')
	announcer.setAttribute('aria-atomic', 'true')
	announcer.style.cssText = visuallyHiddenStyle
	document.body.append(announcer)
}
