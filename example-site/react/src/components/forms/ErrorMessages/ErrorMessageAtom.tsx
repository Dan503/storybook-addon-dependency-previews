import { useRef } from 'react'
import type { FieldState } from 'final-form'

export interface PropsForErrorMessageAtom {
	error: string | Error
	field?: FieldState<any>
}

export function ErrorMessageAtom({ error, field }: PropsForErrorMessageAtom) {
	const errorMessage = typeof error === 'string' ? error : error.message
	const buttonRef = useRef<HTMLButtonElement>(null)

	return (
		<p
			key={typeof error === 'string' ? error : error.message}
			className="text-red-900 font-bold leading-none"
		>
			{field ? (
				<button
					ref={buttonRef}
					type="button"
					className="underline hover:no-underline"
					onClick={() => {
						const form = buttonRef.current?.closest('form')
						const input = form?.querySelector<HTMLInputElement>(
							`[name="${field.name}"]`,
						)
						input?.focus()
					}}
				>
					{errorMessage}
				</button>
			) : (
				errorMessage
			)}
		</p>
	)
}
