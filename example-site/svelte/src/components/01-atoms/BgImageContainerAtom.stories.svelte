<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import BgImageContainerAtom, {
		type PropsForBgImageContainerAtom
	} from './BgImageContainerAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Bg Image Container Atom',
		component: BgImageContainerAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForBgImageContainerAtom, 'children'>;
</script>

<Story
	name="Primary"
	args={{
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: 'Placeholder Image'
	} satisfies Args}
>
	<p class="border-2 border-dashed border-red-500 p-4 text-2xl font-bold text-black">
		Content inside BgImageContainer
	</p>
</Story>
