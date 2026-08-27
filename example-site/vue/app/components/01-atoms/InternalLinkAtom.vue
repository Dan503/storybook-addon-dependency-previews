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
	 * Class to add while the page on screen is this link's own page, or one
	 * inside it. Left off, vue-router still marks the link, with its own
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
		:to="getFullAddressViaBrackets({ href, hrefParams })"
		:activeClass="activeClass"
	>
		<slot />
	</NuxtLink>
</template>
