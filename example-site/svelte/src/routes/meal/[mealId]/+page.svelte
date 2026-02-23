<script lang="ts">
	import type { PageProps } from '../$types';
	import type { Meal } from 'example-site-shared/data';
	import DetailPageTemplate from '../../../components/04-templates/DetailPageTemplate.svelte';

	const { data }: PageProps = $props();

	const { name } = $derived(data.mealDetails || {}) as Meal;
</script>

<svelte:head>
	<title>{name} - [SVELTE] The Storybook Dependency Previews Example Site</title>
	<meta
		name="description"
		content="Learn more about {name} at The Meal Place! Discover its recipe, ingredients, and cooking instructions."
	/>
</svelte:head>

<DetailPageTemplate meal={data?.mealDetails} isLoading={!data} />
