export interface PropsForErrorMessageAtom {
	error: string | Error
}

export function ErrorMessageAtom(props: PropsForErrorMessageAtom) {
	return (
		<p class="text-red-900 font-bold leading-none">
			{typeof props.error === 'string' ? props.error : props.error.message}
		</p>
	)
}
