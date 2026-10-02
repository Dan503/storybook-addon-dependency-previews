/**
 * Names the page in the browser tab.
 *
 * Called while the page draws. Setting the same title twice does nothing, so a
 * page drawing more than once costs nothing.
 *
 * @param title - what the tab should read
 */
export function setPageTitle(title: string) {
	document.title = title
}
