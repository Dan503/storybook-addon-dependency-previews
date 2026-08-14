import { getInput, type FormSchema } from '@formisch/solid'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<TSchema extends FormSchema>(
	props: WithForm<TSchema>,
) {
	const indentSpaces = 3

	// The form is read inside the markup below, not into a variable up here, so
	// that the preview keeps up as the person fills the form in. Solid only
	// re-draws the parts of the page that read a value from inside the markup.
	return (
		<pre class="overflow-auto">
			<code>{JSON.stringify(getInput(props.form), null, indentSpaces)}</code>
		</pre>
	)
}
