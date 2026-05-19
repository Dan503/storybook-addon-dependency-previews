<script lang="ts" module>
	import type { WithForm } from '../../forms/FormTypes';
	import { getInput, type Schema } from '@formisch/svelte';

	export type PropsForFormDataPreviewAtom<TSchema extends Schema> = WithForm<TSchema>;
</script>

<script lang="ts" generics="TSchema extends Schema">
	const { form }: PropsForFormDataPreviewAtom<TSchema> = $props();
	const formValues = $derived(getInput(form));
</script>

<pre class="overflow-auto"><code>{JSON.stringify(formValues, null, 3)}</code></pre>
