export interface PropsForErrorMessageAtom {
	error: string | Error
}

export function ErrorMessageAtom({ error }: PropsForErrorMessageAtom) {
	return (
		<p class="text-red-900 font-bold leading-none">
			{typeof error === 'string' ? error : error.message}
		</p>
	)
}
