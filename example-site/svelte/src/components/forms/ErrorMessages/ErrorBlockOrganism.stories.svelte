<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ErrorBlockOrganism, { type PropsForErrorBlockOrganism } from './ErrorBlockOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Error Messages / Error Block Organism',
		component: ErrorBlockOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForErrorBlockOrganism, 'children'>;
	const errorStrings = ['Error One', 'Second error'];
	const errorObjects = errorStrings.map((err) => new Error(err));
</script>

<Story name="Error Strings" args={{ errors: errorStrings } satisfies Args} />

<Story name="Error Objects" args={{ errors: errorObjects } satisfies Args} />

<Story name="No Errors" args={{ errors: [] } satisfies Args} />
