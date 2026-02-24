<script lang="ts">
	import type { Meal } from 'example-site-shared/data';
	import DetailPageTemplate from '../../../components/04-templates/DetailPageTemplate.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const { name } = $derived(data.mealDetails || {}) as Meal;
</script>

<svelte:head>
	<meta
		name="description"
		content="Learn more about {name} at The Meal Place! Discover its recipe, ingredients, and cooking instructions."
	/>
</svelte:head>

<DetailPageTemplate meal={data?.mealDetails} isLoading={!data} />
