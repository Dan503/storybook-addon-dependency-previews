import { Directive, computed, input } from '@angular/core';
import {
	getFullAddressViaColons,
	type ColonRouteTemplate,
	type HrefParams,
} from 'example-site-shared/utils';

/**
 * Points a link at a page inside this site. Pairs with `ExternalLinkAtom`, which
 * is for addresses outside it.
 *
 * A route is named rather than an address: `/meal/:mealId` says where meal pages
 * live, and the piece that completes it is supplied separately, which this fills
 * in. Only a route the site actually has is accepted, so a misspelt or
 * wrong-shaped one fails the type check — which is the whole point of the change
 * this arrived in.
 *
 * It is a directive on the anchor rather than a component wrapped around one, so
 * it adds no element of its own and no layout has to be rearranged to take it.
 * Every use of it here is on an anchor the surrounding markup already had.
 *
 * The links it draws are plain ones, so following a card reloads the whole page
 * rather than moving within the site. That is how the site already behaved, and
 * this is the one place that would change if it ever moves onto the router's own
 * link.
 */
@Directive({
	selector: 'a[internalLink]',
	standalone: true,
	host: { '[attr.href]': 'fullAddress()' },
})
export class InternalLinkAtomDirective {
	internalLink = input.required<ColonRouteTemplate>();
	hrefParams = input<HrefParams>();
	protected fullAddress = computed(() =>
		getFullAddressViaColons({
			href: this.internalLink(),
			hrefParams: this.hrefParams(),
		}),
	);
}
