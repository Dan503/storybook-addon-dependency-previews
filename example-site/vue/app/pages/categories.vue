<!--
	Draws nothing of its own — the page inside it is the whole of what appears.

	It exists so that Nuxt treats `/categories` as the parent of both the list of
	categories and a single category's page, rather than as their sibling. That is
	what keeps the "Food categories" link underlined while a category is being
	read: vue-router marks a link as the current page by which page files answer
	the address on screen, so a link to `/categories` reaches `/categories/Beef`
	only once the two are parent and child.

	A page file sitting beside a folder of the same name becomes that folder's
	parent page, which is how Nuxt spells this.
-->

<template>
	<NuxtPage />
</template>
