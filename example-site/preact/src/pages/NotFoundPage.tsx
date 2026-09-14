import { SiteFrameOrganism } from '../components/03-organisms/SiteFrameOrganism'
import { ContentRestraintAtom } from '../components/01-atoms/ContentRestraintAtom'
import { InternalLinkAtom } from '../components/01-atoms/InternalLinkAtom'
import { setPageTitle } from '../lib/pageTitle'

/**
 * Shown for an address the site does not have.
 *
 * Written as an ordinary component rather than only as the router's fallback,
 * because the meal page draws it too — an id the meal database does not know
 * is a page that is not there, the same as a misspelt address.
 */
export function NotFoundPage() {
	setPageTitle('Page not found | The Meal Place')

	return (
		<SiteFrameOrganism>
			<div class="grid place-items-center h-full">
				<ContentRestraintAtom padVertical>
					<div class="grid gap-4 justify-items-start">
						<h1 class="text-3xl font-bold">We could not find that page</h1>
						<p>
							The address you followed does not lead anywhere on this site. It
							may have been mistyped, or the meal it pointed at may no longer be
							in the meal database.
						</p>
						<InternalLinkAtom
							href="/categories"
							class="text-teal-700 underline hover:text-teal-900"
						>
							Browse the food categories instead
						</InternalLinkAtom>
					</div>
				</ContentRestraintAtom>
			</div>
		</SiteFrameOrganism>
	)
}
