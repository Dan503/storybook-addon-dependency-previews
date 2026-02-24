<script lang="ts">
	import type { Meal } from 'example-site-shared/data';
	import { H, Level } from 'svelte-headings';
	import ButtonAtom from '../01-atoms/ButtonAtom.svelte';
	import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.svelte';
	import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.svelte';
	import CompactListingOrganism from '../listings/compact/CompactListingOrganism.svelte';

	export interface PropsForDetailPageTemplate {
		meal: Meal | undefined | null;
		isLoading?: boolean;
	}

	const { meal, isLoading }: PropsForDetailPageTemplate = $props();
</script>

<SiteFrameOrganism>
	<ScreenPaddingAtom padVertical>
		{#if isLoading}
			<p>Loading...</p>
		{:else if !meal}
			<p class="mb-4">Meal not found.</p>
			<ButtonAtom onClick={() => history.back()}>Go back</ButtonAtom>
		{:else}
			<Level>
				<H class="mb-5 text-3xl font-bold">{meal.name}</H>
				<div class="grid gap-4 lg:grid-cols-[2fr_30rem]">
					<div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
						<img src={meal.image} alt={meal.name} class="mt-2" />
						<Level element="div">
							<H class="text-2xl font-bold">Recipe</H>
							<p class="whitespace-pre-wrap">{meal.instructions}</p>
						</Level>
					</div>
					<div class="grid grid-rows-[auto_1fr] items-start gap-4">
						<Level element="div">
							<H class="text-2xl font-bold">Ingredients</H>
							<CompactListingOrganism
								items={meal.ingredients.map((x) => ({
									title: x.ingredient,
									description: x.amount,
									imageSrc: x.imageUrl.small
								}))}
							/>
						</Level>
					</div>
				</div>
			</Level>
		{/if}
	</ScreenPaddingAtom>
</SiteFrameOrganism>
