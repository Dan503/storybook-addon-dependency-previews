<script lang="ts">
	import ErrorMessageAtom from './ErrorMessageAtom.svelte';
	import type { FormErrors } from '../FormTypes';

	export interface PropsForErrorListMolecule {
		errors: FormErrors;
	}

	const { errors }: PropsForErrorListMolecule = $props();
</script>

{#if errors && errors.length > 0}
	<ul class="ErrorListMolecule grid gap-1 pl-6">
		{#each errors as err}
			<li class="list-outside list-disc">
				<ErrorMessageAtom error={err} />
			</li>
		{/each}
	</ul>
{/if}
