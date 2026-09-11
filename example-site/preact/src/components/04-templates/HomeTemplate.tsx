import type { Meal } from 'example-site-shared/utils'
import { ExternalLinkAtom } from '../01-atoms/ExternalLinkAtom'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import { HeroBlockOrganism } from '../03-organisms/HeroBlockOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { getMealCard } from '../listings/card/CardMolecule'

export interface PropsForHomeTemplate {
	featuredMeals: Array<Meal>
}

export function HomeTemplate({ featuredMeals }: PropsForHomeTemplate) {
	// Read with a question mark because this site's home page starts with no
	// meals at all and fetches them once the page is on screen, so there is a
	// moment where there is no first meal to take a picture from. The hero
	// block already accepts a missing picture. The Angular site's home page
	// does the same, for the same reason.
	const [featureMeal, ...otherMeals] = featuredMeals
	return (
		<SiteFrameOrganism>
			<div class="HomeTemplate">
				<HeroBlockOrganism
					title={
						<>
							Welcome to the
							<br />
							<ExternalLinkAtom href="https://github.com/Dan503/storybook-addon-dependency-previews">
								Storybook Dependency Previews
							</ExternalLinkAtom>
							<br />
							example site
						</>
					}
					imgSrc={featureMeal?.image}
				>
					<p>
						This is an example site to demonstrate the dependency preview addon
						in a realistic environment.
					</p>
				</HeroBlockOrganism>
				<ScreenPaddingAtom padVertical>
					<h2 class="text-2xl font-bold mb-4">Featured meals:</h2>
					<CardListingOrganism cards={otherMeals.map(getMealCard)} />
				</ScreenPaddingAtom>
			</div>
		</SiteFrameOrganism>
	)
}
