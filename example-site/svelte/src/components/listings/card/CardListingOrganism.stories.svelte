<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardListingOrganism, {
		type PropsForCardListingOrganism
	} from './CardListingOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { mealCards } from 'example-site-shared/data';

	// The shared example cards mark a changing piece the way the React site's router does
	// (`$mealId`). Swap in the way SvelteKit marks it, so the address is one this site has.
	const mealCardsForThisSite = mealCards.map((card) => ({
		...card,
		href: '/meal/[mealId]' as const
	}));

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
					meals: mealCardsForThisSite
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
