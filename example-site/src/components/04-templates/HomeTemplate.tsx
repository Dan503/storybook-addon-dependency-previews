import type { Meal } from '../../utils/mealDbApiUtils'
import { HeroBlockOrganism } from '../03-organisms/HeroBlockOrganism'
import { H, Section } from 'react-headings'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import type { Category } from '../../data/example-meal-data'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

export interface PropsForHomeTemplate {
	randomMeal: Meal
	categoryList: Array<Category>
}

export function HomeTemplate({
	categoryList,
	randomMeal,
}: PropsForHomeTemplate) {
	return (
		<SiteFrameOrganism>
			<div className="HomeTemplate">
				<HeroBlockOrganism
					title="Welcome to the Storybook Dependency Previews example site"
					imgSrc={randomMeal.image}
				>
					<p>
						This is an example site to demonstrate the dependency preview addon
						in a realistic environment
					</p>
				</HeroBlockOrganism>
				<ScreenPaddingAtom padVertical>
					<Section component={<></>}>
						<H className="text-2xl font-bold mb-4">
							Select what type of meal you would like to explore:
						</H>
						<CardListingOrganism
							cards={categoryList
								.toSorted((a, b) => a.strCategory.localeCompare(b.strCategory))
								.map((c) => ({
									title: c.strCategory,
									description: c.strCategoryDescription,
									imgSrc: c.strCategoryThumb,
									href: '#',
								}))}
						/>
					</Section>
				</ScreenPaddingAtom>
			</div>
		</SiteFrameOrganism>
	)
}
