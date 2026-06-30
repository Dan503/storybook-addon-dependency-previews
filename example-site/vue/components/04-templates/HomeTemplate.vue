<script setup lang="ts">
import { computed } from 'vue'
import type { Meal } from 'example-site-shared/data'
import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.vue'
import HeroBlockOrganism from '../03-organisms/HeroBlockOrganism.vue'
import ExternalLinkAtom from '../01-atoms/ExternalLinkAtom.vue'
import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.vue'
import CardListingOrganism from '../listings/card/CardListingOrganism.vue'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.vue'

export interface PropsForHomeTemplate {
	featuredMeals: Array<Meal>
}

const { featuredMeals } = defineProps<PropsForHomeTemplate>()

const featureMeal = computed(() => featuredMeals[0])
const cards = computed(() =>
	featuredMeals.slice(1).map(
		(meal): PropsForCardMolecule => ({
			title: meal.name,
			description: meal.area,
			imgSrc: meal.image,
			href: `/meal/${meal.id}`,
		}),
	),
)
</script>

<template>
	<SiteFrameOrganism>
		<div class="HomeTemplate">
			<HeroBlockOrganism :imgSrc="featureMeal?.image">
				<template #title>
					Welcome to the
					<br />
					<ExternalLinkAtom
						href="https://github.com/Dan503/storybook-addon-dependency-previews"
					>
						Storybook Dependency Previews
					</ExternalLinkAtom>
					<br />
					example site
				</template>
				<p>
					This is an example site to demonstrate the dependency preview addon in
					a realistic environment.
				</p>
			</HeroBlockOrganism>
			<ScreenPaddingAtom padVertical>
				<h2 class="mb-4 text-2xl font-bold">Featured meals:</h2>
				<CardListingOrganism :cards="cards" />
			</ScreenPaddingAtom>
		</div>
	</SiteFrameOrganism>
</template>
