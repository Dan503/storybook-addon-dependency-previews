<script lang="ts">
	import type { PropsForCompactListingMolecule } from './CompactListingMolecule.svelte';
	import CompactListingMolecule from './CompactListingMolecule.svelte';

	export interface PropsForCompactListingOrganism {
		items: Array<PropsForCompactListingMolecule>;
	}

	const { items }: PropsForCompactListingOrganism = $props();
</script>

<ul class="CompactListingOrganism gap-4">
	{#each items as item (item.title)}
		<li>
			<CompactListingMolecule {...item} />
		</li>
	{/each}
</ul>

<style>
	.CompactListingOrganism {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}
</style>
