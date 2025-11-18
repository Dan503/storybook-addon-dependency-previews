import type { Meal } from '../../utils/mealDbApiUtils'
import { HeroBlockOrganism } from '../03-organisms/HeroBlockOrganism'
import { H, Section } from 'react-headings'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

export interface PropsForHomeTemplate {
	featuredMeals: Array<Meal>
}

export function HomeTemplate({ featuredMeals }: PropsForHomeTemplate) {
	const [featureMeal, ...otherMeals] = featuredMeals
	return (
		<SiteFrameOrganism>
			<div className="HomeTemplate">
				<HeroBlockOrganism
					title="Welcome to the Storybook Dependency Previews example site"
					imgSrc={featureMeal.image}
				>
					<p>
						This is an example site to demonstrate the dependency preview addon
						in a realistic environment.
					</p>
				</HeroBlockOrganism>
				<ScreenPaddingAtom padVertical>
					<Section component={<></>}>
						<H className="text-2xl font-bold mb-4">Featured meals:</H>
						<CardListingOrganism
							cards={otherMeals.map((c) => ({
								title: c.name,
								description: c.area,
								imgSrc: c.image,
								href: '/meal/$mealId',
								hrefParams: { mealId: c.id },
							}))}
						/>
					</Section>
				</ScreenPaddingAtom>
			</div>
		</SiteFrameOrganism>
	)
}
