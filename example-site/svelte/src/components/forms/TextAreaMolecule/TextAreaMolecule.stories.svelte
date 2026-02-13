<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextAreaMolecule, { type PropsForTextAreaMolecule } from './TextAreaMolecule.svelte';
	import TextAreaMoleculeDecorator from './TextAreaMolecule.decorator.svelte';
	import TextAreaMoleculeErrorDecorator from './TextAreaMoleculeError.decorator.svelte';

	const { Story } = defineMeta({
		title: 'Forms / Text Area Molecule',
		component: TextAreaMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForTextAreaMolecule, 'children'>;
</script>

<Story name="Primary" args={{ label: 'Message', placeholder: 'Enter your message' } satisfies Args}>
	{#snippet template(args)}
		<TextAreaMoleculeDecorator {...args} />
	{/snippet}
</Story>

<Story name="Error State" args={{ label: 'Message', placeholder: 'Enter your message' } satisfies Args}>
	{#snippet template(args)}
		<TextAreaMoleculeErrorDecorator {...args} />
	{/snippet}
</Story>
