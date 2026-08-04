import type { Meal } from 'example-site-shared/utils'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import { HeroBlockOrganism } from '../03-organisms/HeroBlockOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { ExternalLinkAtom } from '../01-atoms/ExternalLinkAtom'

export interface PropsForHomeTemplate {
	featuredMeals: Array<Meal>
}

export function HomeTemplate({ featuredMeals }: PropsForHomeTemplate) {
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
					imgSrc={featureMeal.image}
				>
					<p>
						This is an example site to demonstrate the dependency
						preview addon in a realistic environment.
					</p>
				</HeroBlockOrganism>
				<ScreenPaddingAtom padVertical>
					<h2 class="text-2xl font-bold mb-4">Featured meals:</h2>
					<CardListingOrganism
						cards={otherMeals.map((c) => ({
							title: c.name,
							description: c.area,
							imgSrc: c.image,
							href: '/meal/$mealId',
							hrefParams: { mealId: c.id },
						}))}
					/>
				</ScreenPaddingAtom>
			</div>
		</SiteFrameOrganism>
	)
}
