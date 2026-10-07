let titleForPageBeingBuilt = ''

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
 * @param title - what the tab should read
 */
export function setPageTitle(title: string) {
	applyPageTitle(title)
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
 * Names the page with a placeholder until its real title is known — the meal
 * page uses it while its meal is on its way, since the title is the meal's
 * name.
 *
 * @param title - what the tab should read in the meantime
 */
export function setStandInPageTitle(title: string) {
	applyPageTitle(title)
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
