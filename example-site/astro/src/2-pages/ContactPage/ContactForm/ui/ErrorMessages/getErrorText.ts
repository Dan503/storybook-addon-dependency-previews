/** The text of an error, whether it arrived as plain text or as an `Error`. */
export function getErrorText(error: string | Error): string {
	return typeof error === 'string' ? error : error.message
}
