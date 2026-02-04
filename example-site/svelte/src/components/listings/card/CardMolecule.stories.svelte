<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardMolecule, { type PropsForCardMolecule } from './CardMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { exampleMeal } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Listings / Card / Card Molecule',
		component: CardMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForCardMolecule, 'children'>;
</script>

<Story
	name="Primary"
	args={{
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image
	} satisfies Args}
>
	{#snippet template(args)}
		<div style:width="400px" class="mx-auto border border-dashed border-gray-500 p-4">
			<CardMolecule {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Full width"
	args={{
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image
	} satisfies Args}
/>
