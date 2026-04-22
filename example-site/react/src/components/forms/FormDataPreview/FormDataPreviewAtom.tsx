import { getInput } from '@formisch/react'
import type { Schema } from '@formisch/react'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<TSchema extends Schema>({
	form,
}: WithForm<TSchema>) {
	const formValues = getInput(form)

	return (
		<pre className="overflow-auto">
			<code>{JSON.stringify(formValues, null, 3)}</code>
		</pre>
	)
}
