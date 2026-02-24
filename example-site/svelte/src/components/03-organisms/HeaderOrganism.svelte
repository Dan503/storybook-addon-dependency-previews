<script>
	import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.svelte';
	import MainNavMolecule from '../02-molecules/MainNavMolecule.svelte';
	import logo from '$lib/assets/simplified-logo.png';
</script>

<header class="border-b-2 border-teal-900 bg-teal-100 p-2 text-black">
	<ScreenPaddingAtom>
		<div
			class="flex w-full items-center justify-between gap-2 max-md:flex-col max-md:justify-center"
		>
			<a href="/" class="flex items-center gap-2">
				<img src={logo} alt="Logo" height={50} width={50} />
				<p class="text-3xl font-extrabold">The Meal Place</p>
			</a>
			<MainNavMolecule />
		</div>
	</ScreenPaddingAtom>
</header>
