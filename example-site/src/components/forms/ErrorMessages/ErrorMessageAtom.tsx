export interface PropsForErrorMessageAtom {
	error: string | Error
}

export function ErrorMessageAtom({ error }: PropsForErrorMessageAtom) {
	return (
		<p
			key={typeof error === 'string' ? error : error.message}
			className="text-red-900 font-bold leading-none"
		>
			{typeof error === 'string' ? error : error.message}
		</p>
	)
}
