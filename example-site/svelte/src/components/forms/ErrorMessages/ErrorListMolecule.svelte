<script lang="ts">
	import ErrorMessageAtom from './ErrorMessageAtom.svelte';

	export interface PropsForErrorListMolecule {
		errors: Array<string | Error>;
	}

	const { errors }: PropsForErrorListMolecule = $props();
</script>

<ul class="ErrorListMolecule grid gap-1 pl-6">
	{#each errors as err}
		<li class="list-outside list-disc">
			<ErrorMessageAtom error={err} />
		</li>
	{/each}
</ul>
