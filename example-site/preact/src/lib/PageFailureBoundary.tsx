import { Component } from 'preact'
import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import { LoadFailurePage } from '../pages/LoadFailurePage'
import {
	checkHasLeftOpeningPage,
	forgetFailedRequests,
	recordOpeningPageReplaced,
} from './useFetchedData'
import { handlePageReplaced } from './pageChange'

interface PropsForPageFailureCatcher {
	children?: ComponentChildren
}

interface PropsForPageFailureBoundary extends PropsForPageFailureCatcher {
	/**
	 * The address on screen. Not drawn — it is here so the boundary can tell
	 * that the reader has moved on and stop showing the previous page's
	 * failure.
	 */
	path: string
}

interface StateForPageFailureBoundary {
	hasFailed: boolean
}

/**
 * Catches a page that could not get its meals, and draws the failure page.
 *
 * Written as a class because preact walks up from the throw looking for a
 * component carrying either `componentDidCatch` or a `getDerivedStateFromError`
 * on its constructor, and a class is the plain way to carry one. This one uses
 * `componentDidCatch`; either would do. preact-iso's own `ErrorBoundary` builds
 * `componentDidCatch` from an `onError` prop, so without one it catches a
 * thrown request and nothing else, which is why it cannot do this job.
 *
 * It is deliberately absent while the pages are being built: `App` is what the
 * build draws, and this only wraps the browser's copy, so a failing request
 * there stops the build rather than writing out a page saying the meals could
 * not be loaded.
 *
 * Showing the failure page, leaving it and trying again each replace the page
 * on screen, the same as a move between pages, so each hands over to
 * `handlePageReplaced` to move focus and read out the title. The router cannot
 * report these itself: the failure page is drawn where the router was, and the
 * router drawn after it is a new one, which starts out on the address already
 * on screen and so has no change to report.
 */
class PageFailureBoundary extends Component<
	PropsForPageFailureBoundary,
	StateForPageFailureBoundary
> {
	state: StateForPageFailureBoundary = { hasFailed: false }

	componentDidCatch(failure: Error) {
		// Written out as well as drawn, because the failure page says only that
		// something went wrong — whoever is debugging needs the actual error.
		console.error('A page could not get its meals:', failure)
		this.setState({ hasFailed: true }, () => {
			// A failure on the first load replaces nothing the reader has
			// reached yet, so focus is left where it is, as on any first load.
			if (checkHasLeftOpeningPage()) handlePageReplaced()
		})
	}

	componentDidUpdate(previousProps: PropsForPageFailureBoundary) {
		// Stop showing a failure once the reader has moved to another page, so
		// one page's failure does not follow them around the site.
		//
		// Done by clearing the state rather than by giving this component a
		// `key` that changes with the address, because a changing key rebuilds
		// this component, and the router below it, on every move rather than
		// only after a failure — and a new router has no page change to report,
		// so focus and the title read-out would stop following moves.
		//
		// The router is still rebuilt when the failure state itself changes:
		// this boundary sits above the router, so showing the failure page
		// draws something else where the router was, and leaving it draws a
		// new router. Nothing shows for it. By then the reader has either left
		// the page the site opened on or pressed Try again, so the new router's
		// page draws its loading view at once rather than leaving the site
		// blank while its meals are fetched.
		const hasMovedOn = previousProps.path !== this.props.path
		if (hasMovedOn && this.state.hasFailed) {
			this.setState({ hasFailed: false }, handlePageReplaced)
		}
	}

	tryAgain = () => {
		recordOpeningPageReplaced()
		forgetFailedRequests()
		this.setState({ hasFailed: false }, handlePageReplaced)
	}

	render() {
		if (this.state.hasFailed) {
			return <LoadFailurePage onTryAgain={this.tryAgain} />
		}
		return this.props.children
	}
}

/**
 * Hands the boundary above the address on screen.
 *
 * A boundary that has caught something stays caught until it is told
 * otherwise, so it needs to know when the reader has moved on. The address is
 * passed as an ordinary prop rather than as a `key`, because a changed key
 * would rebuild the boundary and take the router with it — see
 * `componentDidUpdate` above for what that costs.
 */
export function PageFailureCatcher({ children }: PropsForPageFailureCatcher) {
	const { path } = useLocation()
	return <PageFailureBoundary path={path}>{children}</PageFailureBoundary>
}
