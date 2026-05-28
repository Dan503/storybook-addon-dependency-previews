import { computed } from 'vue'
import { useRoute } from 'vue-router'

export type NavItem = 'home' | 'categories' | 'contact' | null

const pathToNavItem: Record<string, Exclude<NavItem, null>> = {
	'/': 'home',
	'/categories': 'categories',
	'/contact': 'contact',
}

export function useActiveNavItem() {
	const route = useRoute()
	return computed<NavItem>(() => pathToNavItem[route.path] ?? null)
}
