import { createAddressFiller } from 'example-site-shared/utils'

/**
 * Fills a changing piece into one of this site's addresses and hands back the
 * address to link to.
 *
 * `example-site-shared` exports a `getFullAddress` too, and it means something
 * slightly different: its spelling marks a changing piece `$name`, where this
 * site marks it `[name]` — the way Nuxt names the page file that answers the
 * address. The name is shared deliberately so the example sites read alike, and
 * no file imports both.
 *
 * Reaching for the wrong one is caught rather than silent: the shared filler
 * only accepts a `$`-spelled address, so handing it one of this site's fails the
 * type check instead of quietly handing back an address with its brackets still
 * in it.
 */
export const getFullAddress = createAddressFiller({ before: '[', after: ']' })
