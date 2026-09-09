import { SiteFrameOrganism } from '../components/03-organisms/SiteFrameOrganism'
import { ContentRestraintAtom } from '../components/01-atoms/ContentRestraintAtom'
import { ButtonAtom } from '../components/01-atoms/ButtonAtom'
import { setPageTitle } from '../lib/pageTitle'

export interface PropsForLoadFailurePage {
	/** What to do when the reader asks to try again. */
	onTryAgain: () => void
}

/**
 * Shown when a page could not get its meals.
 *
 * What decides whether a page can end up here is not whether it asks the meal
 * database but whether it *pauses* for the answer. The categories page, a
 * single category and a meal all ask through `useDataOrWait`, which pauses the
 * page, so a dropped connection or a bad answer would otherwise leave the
 * whole site blank. The home page asks too, but through an effect rather than
 * by pausing, so a failure there never reaches this page — it simply draws
 * with no meals.
 *
 * Meal pages are the likeliest to meet this, because they are the only ones
 * not written out ahead of time, so every visit to one asks.
 */
export function LoadFailurePage({ onTryAgain }: PropsForLoadFailurePage) {
	setPageTitle('Something went wrong | The Meal Place')

	return (
		<SiteFrameOrganism>
			<div class="grid place-items-center h-full">
				<ContentRestraintAtom padVertical>
					<div class="grid gap-4 justify-items-start">
						<h1 class="text-3xl font-bold">We could not load the meals</h1>
						<p>
							The meal database did not answer. It may be down, or your
							connection may have dropped.
						</p>
						<ButtonAtom onClick={onTryAgain}>Try again</ButtonAtom>
					</div>
				</ContentRestraintAtom>
			</div>
		</SiteFrameOrganism>
	)
}
