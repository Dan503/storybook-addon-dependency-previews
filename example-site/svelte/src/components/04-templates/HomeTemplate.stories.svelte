<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import HomeTemplate, { type PropsForHomeTemplate } from './HomeTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { featuredMealsData } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: '04 Templates / Home Template',
		component: HomeTemplate,
		tags: ['autodocs', 'template'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters,
		argTypes: {
			// Use mapping to prevent large data from being serialized into URL
			featuredMeals: {
				mapping: {
					featured: featuredMealsData
				},
				control: {
					type: 'select'
				},
				options: ['featured']
			}
		}
	});
	type Args = Omit<PropsForHomeTemplate, 'children'>;
</script>

<Story name="Primary" args={{ featuredMeals: 'featured' as any } satisfies Args} />
