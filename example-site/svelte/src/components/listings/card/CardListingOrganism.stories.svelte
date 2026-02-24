<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardListingOrganism, {
		type PropsForCardListingOrganism
	} from './CardListingOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { mealCards } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Listings / Card / Card Listing Organism',
		component: CardListingOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters,
		argTypes: {
			cards: {
				mapping: {
					meals: mealCards
				},
				control: {
					type: 'select'
				},
				options: ['meals']
			}
		}
	});
	type Args = Omit<PropsForCardListingOrganism, 'children'>;
</script>

<Story name="Primary" args={{ cards: 'meals' } as unknown as Args}>
	{#snippet template(args)}
		<CardListingOrganism {...args} />
	{/snippet}
</Story>
