<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import HeroBlockOrganism, { type PropsForHeroBlockOrganism } from './HeroBlockOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '03 Organisms / Hero Block Organism',
		component: HeroBlockOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForHeroBlockOrganism, 'children'>;
</script>

<Story
	name="Primary"
	args={{
		title: 'Hero Block Title',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg'
	} satisfies Args}
>
	<p>This is where the hero block content goes.</p>
</Story>
