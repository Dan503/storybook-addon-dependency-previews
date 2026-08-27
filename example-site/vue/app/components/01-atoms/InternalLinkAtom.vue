<script lang="ts">
import type { LinkAddressPropsViaBrackets } from 'example-site-shared/utils'

/**
 * A link to a page inside this site. Pairs with `ExternalLinkAtom`, which is for
 * addresses outside it.
 *
 * `NuxtLink` takes any text at all as its address, so every internal link goes
 * through this one instead: `href` only accepts an address the site actually
 * has, which means a misspelt or wrong-shaped one fails the type check. An
 * address with a marked-out name in it needs that piece supplied as
 * `hrefParams`, and this fills it in, because `NuxtLink` wants a finished
 * address. That part is not checked by the type — a missing piece throws when
 * the link is drawn.
 *
 * The bracket spelling is the one this site writes: `/meal/[mealId]` is the
 * address `pages/meal/[mealId].vue` answers. The two address props and what they
 * mean come from `LinkAddressPropsViaBrackets` rather than being restated here.
 *
 * `activeClass` is the only thing named here beyond the address; a `class` and
 * the link's own content reach the anchor without help.
 */
export interface PropsForInternalLinkAtom extends LinkAddressPropsViaBrackets {
	/**
	 * Class to add while this link points at the page on screen. It also covers a
	 * page sitting under the same parent page file, which is what keeps
	 * `/categories` marked while a category is being read, and the whole reason
	 * `pages/categories.vue` exists.
	 *
	 * vue-router goes by which page files answer the address, never by one
	 * address starting with another's text — so `/` is not marked on `/contact`.
	 *
	 * Left off, vue-router still marks the link, with its own
	 * `router-link-active` name — nothing here styles that, so a link without
	 * this looks the same on its own page as anywhere else.
	 */
	activeClass?: string
}
</script>

<script setup lang="ts">
import { getFullAddressViaBrackets } from 'example-site-shared/utils'

const { href, hrefParams, activeClass } =
	defineProps<PropsForInternalLinkAtom>()
</script>

<template>
	<NuxtLink
		class="InternalLinkAtom"
		:to="getFullAddressViaBrackets({ href, hrefParams })"
		:activeClass="activeClass"
	>
		<slot />
	</NuxtLink>
</template>
