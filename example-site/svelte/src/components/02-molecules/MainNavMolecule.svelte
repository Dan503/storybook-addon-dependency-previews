<script>
	import { activeNavItem } from '../../lib/store';
</script>

<nav class="flex flex-row">
	<div class="px-2 font-bold">
		<a href="/" class:underline={$activeNavItem === 'home'}>Home</a>
	</div>

	<div class="px-2 font-bold">
		<a href="/categories" class:underline={$activeNavItem === 'categories'}>Food categories</a>
	</div>

	<div class="px-2 font-bold">
		<a href="/contact" class:underline={$activeNavItem === 'contact'}>Contact us</a>
	</div>
</nav>
