import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import {
	getFullAddressViaColons,
	type LinkAddressPropsViaColons,
} from 'example-site-shared/utils'

/**
 * A link to a page inside this site. Pairs with `ExternalLinkAtom`, which is
 * for addresses outside it.
 *
 * preact-iso has no link component of its own — it moves between pages by
 * catching clicks on ordinary links — so this is where every internal link
 * goes. It only accepts an address the site actually has, which means a
 * misspelt or wrong-shaped one fails the type check. An address with a `:name`
 * piece in it needs that piece supplied as `hrefParams`, and this fills it in.
 * That part is not checked by the type — a missing piece throws when the link
 * is drawn.
 *
 * The colon spelling is the one preact-iso matches on, so `/meal/:mealId` is
 * the address the meal route answers. The two address props and what they mean
 * come from `LinkAddressPropsViaColons` rather than being restated here.
 */
export interface PropsForInternalLinkAtom extends LinkAddressPropsViaColons {
	class?: string
	/**
	 * Class to add while this link points at the page on screen. It also covers
	 * a page sitting underneath, which is what keeps `/categories` marked while
	 * a category is being read.
	 *
	 * Some of the sibling sites get this from their router — Solid, Vue and
	 * Angular each have a link that marks itself. preact-iso only reports the
	 * current address, so `checkIsCurrentPage` below works it out instead,
	 * which is what Svelte does too.
	 */
	activeClass?: string
	children?: ComponentChildren
}

export function InternalLinkAtom({
	href,
	hrefParams,
	class: ownClass = 'text-teal-700 hover:text-teal-900',
	activeClass = '',
	children,
}: PropsForInternalLinkAtom) {
	const fullAddress = getFullAddressViaColons({ href, hrefParams })
	// preact-iso hands back an empty object outside a location provider, so
	// this is undefined there despite what its type says. The site wraps the
	// whole router in one and Storybook wraps every story in one, so that is
	// not a case either has today; it is checked because the type would not
	// catch it if one ever appeared, and a link that cannot tell which page it
	// is on should still draw.
	const { path } = useLocation()
	const isCurrentPage = checkIsCurrentPage(path, fullAddress)
	const baseStyleClasses = 'hover:underline'
	const classes = [
		baseStyleClasses,
		ownClass,
		isCurrentPage ? activeClass : '',
	].filter(Boolean)
	return (
		<a class={classes.join(' ')} href={fullAddress}>
			{children}
		</a>
	)
}

/**
 * Whether the page on screen is this link's page, or one sitting underneath it.
 *
 * "Underneath" is why the test is not a plain match: `/categories` should stay
 * marked while a single category is being read. It is written as the address
 * plus a slash rather than as a plain starts-with, so that `/` — which every
 * address begins with — marks only the home page, and so that a future
 * `/categories-archive` would not mark `/categories`.
 *
 * @param path - the address on screen, or nothing outside a location provider
 * @param fullAddress - where this link points, with its pieces filled in
 */
function checkIsCurrentPage(
	path: string | undefined,
	fullAddress: string,
): boolean {
	if (!path) return false
	const isSamePage = path === fullAddress
	const isPageUnderneath = path.startsWith(`${fullAddress}/`)
	return isSamePage || isPageUnderneath
}
