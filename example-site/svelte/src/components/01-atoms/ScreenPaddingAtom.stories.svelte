<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ScreenPaddingAtom, { type PropsForScreenPaddingAtom } from './ScreenPaddingAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChildContentAtom from '../zz-meta-components/ChildContentAtom.svelte';

	const { Story } = defineMeta({
		title: '01 Atoms / Screen Padding Atom',
		component: ScreenPaddingAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'fullscreen',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary">
	<ChildContentAtom />
</Story>

<Story
	name="With Vertical Padding"
	args={{ padVertical: true } satisfies PropsForScreenPaddingAtom}
>
	<ChildContentAtom />
</Story>
