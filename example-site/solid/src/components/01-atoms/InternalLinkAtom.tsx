import { A, type AnchorProps } from '@solidjs/router'
import type { RoutePath } from '../../routePaths'

/**
 * A link to a page inside this site. Pairs with `ExternalLinkAtom`, which is
 * for addresses outside it.
 *
 * Solid Start's own link takes any text as its address, so every internal link
 * goes through this one instead: it only accepts an address the site actually
 * has, which means a misspelt or wrong-shaped address fails the type check.
 * Everything else Solid Start's link accepts — `class`, `activeClass`, `end`
 * and the rest — is passed straight through.
 */
export interface PropsForInternalLinkAtom extends Omit<AnchorProps, 'href'> {
	href: RoutePath
}

export function InternalLinkAtom(props: PropsForInternalLinkAtom) {
	return <A {...props} />
}
