import { getInput, type FormSchema } from '@formisch/solid'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<TSchema extends FormSchema>({
	form,
}: WithForm<TSchema>) {
	const formValues = getInput(form)

	return (
		<pre class="overflow-auto">
			<code>{JSON.stringify(formValues, null, 3)}</code>
		</pre>
	)
}
