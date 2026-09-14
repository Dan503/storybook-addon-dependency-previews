import { getInput, type FormSchema } from '@formisch/preact'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<TSchema extends FormSchema>({
	form,
}: WithForm<TSchema>) {
	const indentSpaces = 3
	const formValues = getInput(form)

	return (
		<pre class="overflow-auto">
			<code>{JSON.stringify(formValues, null, indentSpaces)}</code>
		</pre>
	)
}
