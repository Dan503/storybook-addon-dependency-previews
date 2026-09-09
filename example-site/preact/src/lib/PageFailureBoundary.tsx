import { Component } from 'preact'
import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import { LoadFailurePage } from '../pages/LoadFailurePage'
import { forgetFailedRequests } from './useDataOrWait'

interface PropsForPageFailureBoundary {
	children?: ComponentChildren
}

interface StateForPageFailureBoundary {
	hasFailed: boolean
}

/**
 * Catches a page that could not get its meals, and draws the failure page.
 *
 * Written as a class with `componentDidCatch` because that is the only thing
 * preact accepts as an error boundary — it walks up from the throw looking for
 * a component that has one. preact-iso's own `ErrorBoundary` builds that method
 * from an `onError` prop, so without one it catches a *paused* page and nothing
 * else, which is why it cannot do this job.
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
 * The boundary above, rebuilt whenever the address changes.
 *
 * A boundary that has caught something stays caught until it is told
 * otherwise, so without the key a reader who left the failed page behind would
 * carry its failure page onto the next one. Keying it on the address builds a
 * fresh boundary per page instead.
 */
export function PageFailureCatcher({ children }: PropsForPageFailureBoundary) {
	const { path } = useLocation()
	return <PageFailureBoundary key={path}>{children}</PageFailureBoundary>
}
