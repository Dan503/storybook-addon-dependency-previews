import { type AnyFormApi } from '@tanstack/react-form'

interface Props<FormApi extends AnyFormApi> {
	formValues?: FormApi['state']['values']
}

export function FormDataPreviewAtom<FormApi extends AnyFormApi>({
	formValues,
}: Props<FormApi>) {
	return (
		<pre className="overflow-auto">
			<code>{JSON.stringify(formValues, null, 3)}</code>
		</pre>
	)
}
