<script lang="ts">
	import { H, Level } from 'svelte-headings';
	import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.svelte';
	import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.svelte';
	import CardListingOrganism from '../listings/card/CardListingOrganism.svelte';
	import type { PropsForCardMolecule } from '../listings/card/CardMolecule.svelte';

	export interface PropsForCardListTemplate {
		title: string;
		introText?: string;
		cardList?: Array<PropsForCardMolecule>;
	}

	const { title, cardList, introText }: PropsForCardListTemplate = $props();
</script>

<SiteFrameOrganism>
	<ScreenPaddingAtom padVertical>
		<Level class="MealListTemplate grid gap-4">
			<H class="text-4xl font-bold">{title}</H>
			<p class="mb-2">{introText}</p>
			<CardListingOrganism cards={cardList} />
		</Level>
	</ScreenPaddingAtom>
</SiteFrameOrganism>
