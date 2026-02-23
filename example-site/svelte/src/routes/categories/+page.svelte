<script lang="ts">
	import CardListTemplate from '../../components/04-templates/CardListTemplate.svelte';
	import type { PropsForCardMolecule } from '../../components/listings/card/CardMolecule.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { categories } = $derived(data);
	const cardList: Array<PropsForCardMolecule> = $derived(
		categories.map(
			(c) =>
				({
					title: c.strCategory,
					description: c.strCategoryDescription,
					imgSrc: c.strCategoryThumb,
					href: `/category/${c.strCategory}`
				}) satisfies PropsForCardMolecule
		)
	);
</script>

<svelte:head>
	<title>Categories - [SVELTE] The Storybook Dependency Previews Example Site</title>
	<meta
		name="description"
		content="Explore a variety of food categories at The Meal Place! Discover new recipes, ingredients, and culinary inspiration."
	/>
</svelte:head>

<CardListTemplate
	title="Food Categories"
	introText="Explore a variety of food categories at The Meal Place! Discover new recipes, ingredients, and culinary inspiration."
	{cardList}
/>
