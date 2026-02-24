<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>
		{page.data.title} | [SVELTE] The Storybook Dependency Previews Example Site | The Meal Place
	</title>
</svelte:head>
{@render children()}
