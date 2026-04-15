<script>
	import { activeNavItem } from '../../lib/store';
</script>

<nav class="flex flex-row gap-4 font-bold">
	<a href="/" class:underline={$activeNavItem === 'home'}>Home</a>
	<a href="/categories" class:underline={$activeNavItem === 'categories'}>Food categories</a>
	<a href="/contact" class:underline={$activeNavItem === 'contact'}>Contact us</a>
</nav>
