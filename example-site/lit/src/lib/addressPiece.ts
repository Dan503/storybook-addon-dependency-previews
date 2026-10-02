/**
 * Turns a piece of the address back into the text it stands for, such as
 * `Side%20dish` into `Side dish`.
 *
 * The router hands a page the piece still escaped, as it is written in the
 * address, so it is unescaped here exactly once. Unescaping it again would
 * throw on a name carrying a percent sign.
 *
 * Hands back `null` when there is no piece, or when its escaping is broken, as
 * it can be in an address typed by hand: neither leads to a page.
 *
 * @param addressPiece - the piece as the router matched it
 */
export function getTextFromAddressPiece(
	addressPiece: string | undefined,
): string | null {
	if (!addressPiece) return null
	try {
		return decodeURIComponent(addressPiece)
	} catch {
		return null
	}
}
