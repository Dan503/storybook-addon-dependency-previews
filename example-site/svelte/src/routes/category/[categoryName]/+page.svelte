<script lang="ts">
	import CardListTemplate from '../../../components/04-templates/CardListTemplate.svelte';
	import type { PropsForCardMolecule } from '../../../components/listings/card/CardMolecule.svelte';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();

	const cardList: Array<PropsForCardMolecule> = $derived(
		data.mealList.map(
			(meal) =>
				({
					title: meal.name,
					description: meal.area,
					imgSrc: meal.image,
					href: `/meal/${meal.id}`
				}) satisfies PropsForCardMolecule
		)
	);
</script>

<svelte:head>
	<meta
		name="description"
		content="Get in touch with us at The Meal Place! We'd love to hear from you, whether you have questions, feedback, or just want to say hello."
	/>
</svelte:head>

<CardListTemplate
	title="Meals in this category"
	introText="Explore the delicious meals in this category! Click on any meal to discover its recipe, ingredients, and cooking instructions."
	{cardList}
/>
