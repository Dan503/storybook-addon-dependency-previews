<script lang="ts">
	export interface PropsForFormDataPreviewAtom {
		formValues?: Record<string, any>;
	}

	const { formValues }: PropsForFormDataPreviewAtom = $props();
</script>

<pre class="overflow-auto"><code>{JSON.stringify(formValues, null, 3)}</code></pre>
