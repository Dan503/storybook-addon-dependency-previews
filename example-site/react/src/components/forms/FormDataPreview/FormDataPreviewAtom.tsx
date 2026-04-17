interface Props {
	formValues?: Record<string, unknown>
}

export function FormDataPreviewAtom({ formValues }: Props) {
	return (
		<pre className="overflow-auto">
			<code>{JSON.stringify(formValues, null, 3)}</code>
		</pre>
	)
}
