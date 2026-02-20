import { writable } from 'svelte/store';

export type NavItem = 'home' | 'categories' | 'contact' | null;

export const activeNavItem = writable<NavItem>(null);
