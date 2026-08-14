<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardListTemplate from './CardListTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { categoryCardList, mealCardList } from 'example-site-shared/data';

	// The shared example cards mark a changing piece the way the React site's router does
	// (`$category`, `$mealId`). Swap in the way SvelteKit marks it, so each address is one this
	// site has.
	const categoryCardListForThisSite = categoryCardList.map((card) => ({
		...card,
		href: '/categories/[category]' as const
	}));
	const mealCardListForThisSite = mealCardList.map((card) => ({
		...card,
		href: '/meal/[mealId]' as const
	}));

	const { Story } = defineMeta({
		title: '04 Templates / Card List Template',
		component: CardListTemplate,
		tags: ['autodocs', 'template'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters,
		argTypes: {
			// Use mapping to prevent large data from being serialized into URL
			cardList: {
				mapping: {
					categories: categoryCardListForThisSite,
					meals: mealCardListForThisSite
				},
				control: {
					type: 'select'
				},
				options: ['categories', 'meals']
			}
		}
	});
</script>

<Story name="Category list" args={{ cardList: 'categories' as any }} />

<Story name="Meal list" args={{ cardList: 'meals' as any }} />
