<script lang="ts">
	import type { Meal } from 'example-site-shared/data';
	import { H, Level } from 'svelte-headings';
	import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.svelte';
	import HeroBlockOrganism from '../03-organisms/HeroBlockOrganism.svelte';
	import ExternalLinkAtom from '../01-atoms/ExternalLinkAtom.svelte';
	import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.svelte';
	import CardListingOrganism from '../listings/card/CardListingOrganism.svelte';

	export interface PropsForHomeTemplate {
		featuredMeals: Array<Meal>;
	}

	const { featuredMeals }: PropsForHomeTemplate = $props();
	const [featureMeal, ...otherMeals] = $derived(featuredMeals);
</script>

<SiteFrameOrganism>
	<div class="HomeTemplate">
		<HeroBlockOrganism imgSrc={featureMeal.image}>
			{#snippet title()}
				Welcome to the
				<br />
				<ExternalLinkAtom href="https://github.com/Dan503/storybook-addon-dependency-previews">
					Storybook Dependency Previews
				</ExternalLinkAtom>
				<br />
				example site
			{/snippet}

			<p>
				This is an example site to demonstrate the dependency preview addon in a realistic
				environment.
			</p>
		</HeroBlockOrganism>
		<ScreenPaddingAtom padVertical>
			<Level>
				<H class="mb-4 text-2xl font-bold">Featured meals:</H>
				<CardListingOrganism
					cards={otherMeals.map((c) => ({
						title: c.name,
						description: c.area,
						imgSrc: c.image,
						href: '/meal/$mealId',
						hrefParams: { mealId: c.id }
					}))}
				/>
			</Level>
		</ScreenPaddingAtom>
	</div>
</SiteFrameOrganism>
