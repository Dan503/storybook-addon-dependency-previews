<script lang="ts">
	export interface PropsForErrorMessageAtom {
		error: string | Error;
	}

	const { error }: PropsForErrorMessageAtom = $props();
</script>

<p class="leading-none font-bold text-red-900">
	{typeof error === 'string' ? error : error.message}
</p>
