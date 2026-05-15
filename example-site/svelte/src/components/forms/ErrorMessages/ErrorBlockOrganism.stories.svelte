<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ErrorBlockOrganism, { type PropsForErrorBlockOrganism } from './ErrorBlockOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FormErrors } from '../FormTypes';

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
	const errorStrings: FormErrors = ['Error One', 'Second error'];
	const errorObjects: FormErrors = errorStrings.map((err) => new Error(err));
</script>

<Story name="Error Strings" args={{ errors: errorStrings } satisfies Args} />

<Story name="Error Objects" args={{ errors: errorObjects } satisfies Args} />

<Story name="No Errors (empty array)" args={{ errors: [] } satisfies Args} />

<Story name="No Errors (null)" args={{ errors: null } satisfies Args} />
