<script lang="ts">
	import { H, Level } from 'svelte-headings';
	import ErrorListMolecule from './ErrorListMolecule.svelte';
	import type { FormErrors } from '../FormTypes';

	export interface PropsForErrorBlockOrganism {
		errors: FormErrors;
	}

	const { errors }: PropsForErrorBlockOrganism = $props();
</script>

<div role="alert" class="ErrorBlockOrganism">
	{#if errors && errors.length > 0}
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
