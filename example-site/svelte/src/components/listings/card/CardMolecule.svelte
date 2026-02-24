<script lang="ts">
	import { H, Level } from 'svelte-headings';

	export interface PropsForCardMolecule {
		title: string;
		imgSrc: string;
		description: string;
		href: string;
	}

	const { title, imgSrc, description, href }: PropsForCardMolecule = $props();
</script>

<div class="CardMolecule @container grid">
	<a
		{href}
		class="flex h-full gap-2 overflow-hidden rounded-2xl border bg-white transition-all hover:transform-[scale(1.02)] hover:bg-teal-200 hover:shadow-lg focus:bg-teal-200"
	>
		<img src={imgSrc} alt="" class="aspect-video object-cover" />
		<Level class="w-full p-4">
			<H class="text-xl font-bold">{title}</H>
			<p class="line-clamp-4">{description}</p>
		</Level>
	</a>
</div>

<style>
	.CardMolecule {
		@container (400px <= width) {
			img {
				width: 200px;
				aspect-ratio: 1 / 1;
			}
		}
		@container (width < 400px) {
			a {
				flex-direction: column;
			}
			img {
				width: 100%;
				aspect-ratio: 16 / 9;
			}
		}
	}
</style>
