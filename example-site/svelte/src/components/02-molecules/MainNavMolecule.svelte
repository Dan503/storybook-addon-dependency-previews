<script>
	import { resolve } from '$app/paths';
	import { activeNavItem } from '../../lib/store';
</script>

<nav class="flex flex-row gap-4 font-bold">
	<a href={resolve('/')} class:underline={$activeNavItem === 'home'}>Home</a>
	<a href={resolve('/categories')} class:underline={$activeNavItem === 'categories'}>
		Food categories
	</a>
	<a href={resolve('/contact')} class:underline={$activeNavItem === 'contact'}>Contact us</a>
</nav>
