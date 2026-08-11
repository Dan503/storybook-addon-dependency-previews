import { getInput, type FormSchema } from '@formisch/solid'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<TSchema extends FormSchema>({
	form,
}: WithForm<TSchema>) {
	// Read inside the markup, not into a variable above it, so that the preview
	// keeps up as the person fills the form in. Solid only re-draws the parts of
	// the page that read a value from inside the markup.
	const indentSpaces = 3

	return (
		<pre class="overflow-auto">
			<code>{JSON.stringify(getInput(form), null, indentSpaces)}</code>
		</pre>
	)
}
