<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardListTemplate from './CardListTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { categoryCardList, mealCardList } from 'example-site-shared/data';

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
					categories: categoryCardList,
					meals: mealCardList
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
