<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import DetailPageTemplate, { type PropsForDetailPageTemplate } from './DetailPageTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { exampleMeal } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: '04 Templates / Detail Page Template',
		component: DetailPageTemplate,
		tags: ['autodocs', 'template'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters,
		argTypes: {
			// Use mapping to prevent large data from being serialized into URL
			meal: {
				mapping: {
					example: exampleMeal,
					none: undefined
				},
				control: {
					type: 'select'
				},
				options: ['example', 'none']
			}
		}
	});
	type Args = Omit<PropsForDetailPageTemplate, 'children'>;
</script>

<Story name="Primary" args={{ meal: 'example' as any } satisfies Args} />

<Story name="Loading" args={{ meal: null, isLoading: true } satisfies Args} />

<Story name="Null meal" args={{ meal: null, isLoading: false } satisfies Args} />
