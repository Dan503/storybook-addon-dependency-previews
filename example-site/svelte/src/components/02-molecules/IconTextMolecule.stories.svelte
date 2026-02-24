<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import IconTextMolecule, { type PropsForIconTextMolecule } from './IconTextMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MapPinIcon from '../01-atoms/icons/MapPinIcon.svelte';
	import PhoneIcon from '../01-atoms/icons/PhoneIcon.svelte';

	const { Story } = defineMeta({
		title: '02 Molecules / Icon Text Molecule',
		component: IconTextMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForIconTextMolecule, 'children'>;
</script>

<Story name="Map Pin" args={{ Icon: MapPinIcon } satisfies Args}>
	123 Main St, Anytown, Australia
</Story>

<Story name="Phone" args={{ Icon: PhoneIcon } satisfies Args}>0412 345 678</Story>
