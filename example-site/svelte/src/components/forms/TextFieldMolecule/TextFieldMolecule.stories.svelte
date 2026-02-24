<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import TextFieldMolecule, { type PropsForTextFieldMolecule } from './TextFieldMolecule.svelte';
	import TextFieldMoleculeDecorator from './TextFieldMolecule.decorator.svelte';
	import TextFieldMoleculeErrorDecorator from './TextFieldMoleculeError.decorator.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Text Field Molecule',
		component: TextFieldMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForTextFieldMolecule, 'children'>;
</script>

<Story
	name="Primary"
	args={{ label: 'First Name', placeholder: 'Enter your first name' } satisfies Args}
>
	{#snippet template(args)}
		<TextFieldMoleculeDecorator {...args} />
	{/snippet}
</Story>

<Story
	name="Error State"
	args={{ label: 'First Name', placeholder: 'Enter your first name' } satisfies Args}
>
	{#snippet template(args)}
		<TextFieldMoleculeErrorDecorator {...args} />
	{/snippet}
</Story>
