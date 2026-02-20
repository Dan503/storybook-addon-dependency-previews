<script lang="ts">
	import HomeTemplate from '../components/04-templates/HomeTemplate.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<svelte:head>
	<title>The Meal Place - [SVELTE] The Storybook Dependency Previews Example Site</title>
	<meta
		name="description"
		content="This is an example site to demonstrate the dependency preview addon in a realistic environment."
	/>
</svelte:head>

<HomeTemplate featuredMeals={data.featuredMeals} />
