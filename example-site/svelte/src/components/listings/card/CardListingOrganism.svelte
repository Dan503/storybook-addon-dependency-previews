<script lang="ts">
	import CardMolecule, { type PropsForCardMolecule } from './CardMolecule.svelte';

	export interface PropsForCardListingOrganism {
		cards: Array<PropsForCardMolecule> | undefined;
	}

	const { cards }: PropsForCardListingOrganism = $props();
</script>

<div class="@container grid">
	<div class={`CardListingOrganism grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6`}>
		{#each cards as card}
			<CardMolecule {...card} />
		{/each}
	</div>
</div>

<style>
	.CardListingOrganism {
		grid-template-columns: repeat(3, minmax(0, 1fr));

		@container (width < 800px) {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}

		@container (width > 1400px) {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
</style>
