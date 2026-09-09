import { Component } from 'preact'
import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import { LoadFailurePage } from '../pages/LoadFailurePage'
import { forgetFailedRequests } from './useDataOrWait'

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
 * *paused* page and nothing else, which is why it cannot do this job.
 *
 * It is deliberately absent while the pages are being built: `App` is what the
 * build draws, and this only wraps the browser's copy, so a failing request
 * there stops the build rather than writing out a page saying the meals could
 * not be loaded.
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
		this.setState({ hasFailed: true })
	}

	componentDidUpdate(previousProps: PropsForPageFailureBoundary) {
		// Stop showing a failure once the reader has moved to another page, so
		// one page's failure does not follow them around the site.
		//
		// Done by clearing the state rather than by giving this component a
		// `key` that changes with the address. That is about ordinary
		// navigation: a changing key rebuilds this component on *every* move,
		// and rebuilding takes the router below it with it — and the router is
		// what holds the previous page on screen while the next one waits, so
		// a fresh one has nothing to hold and every move blanks the site.
		//
		// It does not save the router from being rebuilt when the failure state
		// itself changes, and nothing here could: showing the failure page
		// means drawing something else in place of the router, which unmounts
		// it either way. So both ways out of a failure — trying again, and
		// leaving for a page whose meals are not already known — blank the site
		// for as long as the request takes, measured at over half a second on a
		// slow one. It puts itself right, and it costs a rebuild only after a
		// failure rather than on every move, which is why it is left as it is.
		const hasMovedOn = previousProps.path !== this.props.path
		if (hasMovedOn && this.state.hasFailed) {
			this.setState({ hasFailed: false })
		}
	}

	tryAgain = () => {
		forgetFailedRequests()
		this.setState({ hasFailed: false })
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
