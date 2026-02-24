<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CompactListingMolecule, {
		type PropsForCompactListingMolecule
	} from './CompactListingMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { exampleIngredient } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Listings / Compact / Compact Listing Molecule',
		component: CompactListingMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForCompactListingMolecule, 'children'>;
</script>

<Story
	name="Primary"
	args={{
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount
	} satisfies Args}
>
	<p>Listings / Compact / Compact Listing Molecule</p>
</Story>
