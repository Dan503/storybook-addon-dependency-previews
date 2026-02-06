<script lang="ts">
	import { H, Level } from 'svelte-headings';
	import ErrorListMolecule from './ErrorListMolecule.svelte';

	export interface PropsForErrorBlockOrganism {
		errors: Array<string | Error>;
	}

	const { errors }: PropsForErrorBlockOrganism = $props();
	console.log('Errors passed to ErrorBlockOrganism:', errors);
</script>

<div role="alert" class="ErrorBlockOrganism">
	{#if errors.length > 0}
		<Level class="rounded-xl bg-red-100 px-4 pt-2">
			<H class="border-b-2 border-red-800 pb-1 text-2xl font-bold">
				Please resolve the following errors
			</H>
			<div class="pt-3 pb-4">
				<ErrorListMolecule {errors} />
			</div>
		</Level>
	{/if}
</div>
