<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CompactListingOrganism, {
		type PropsForCompactListingOrganism
	} from './CompactListingOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ingredientItems } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Listings / Compact / Compact Listing Organism',
		component: CompactListingOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters,
		argTypes: {
			// Use mapping to prevent large data from being serialized into URL
			items: {
				mapping: {
					ingredients: ingredientItems
				},
				control: {
					type: 'select'
				},
				options: ['ingredients']
			}
		}
	});
	type Args = Omit<PropsForCompactListingOrganism, 'children'>;
</script>

<Story
	name="Primary"
	args={{
		items: 'ingredients' as any
	} satisfies Args}
>
	<p>Listings / Compact / Compact Listing Organism</p>
</Story>
