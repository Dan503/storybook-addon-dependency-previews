import { A, type AnchorProps } from '@solidjs/router'
import { splitProps } from 'solid-js'
import {
	getFullAddressViaDollars,
	type DollarRouteAddress,
	type LinkAddress,
} from 'example-site-shared/utils'

/**
 * A link to a page inside this site. Pairs with `ExternalLinkAtom`, which is
 * for addresses outside it.
 *
 * Solid Start's own link takes any text as its address, so every internal link
 * goes through this one instead: it only accepts an address the site actually
 * has, which means a misspelt or wrong-shaped address fails the type check.
 * An address with a `$name` piece in it needs that piece supplied as
 * `hrefParams`, and this component fills it in. That part is not checked by the
 * type — a missing piece throws when the link is drawn. Everything else Solid
 * Start's link accepts — `class`, `activeClass`, `end` and the rest — is passed
 * straight through.
 */
export type PropsForInternalLinkAtom = Omit<AnchorProps, 'href'> &
	LinkAddress<DollarRouteAddress>

export function InternalLinkAtom(props: PropsForInternalLinkAtom) {
	// Held back from the anchor: `hrefParams` is not an anchor attribute, and
	// `href` is replaced by the finished address rather than passed on.
	const [linkAddress, anchorProps] = splitProps(props, ['href', 'hrefParams'])
	return <A {...anchorProps} href={getFullAddressViaDollars(linkAddress)} />
}
