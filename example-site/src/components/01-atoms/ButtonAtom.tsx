import type { ReactNode } from 'react'

export interface PropsForButtonAtom {
	type?: 'button' | 'submit' | 'reset'
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
	children: ReactNode
}

export function ButtonAtom({
	children,
	type = 'button',
	onClick,
}: PropsForButtonAtom) {
	return (
		<button
			type={type}
			onClick={onClick}
			className="bg-teal-200 hover:bg-teal-100 focus:bg-teal-100 border-2 border-teal-900 px-4 py-1 rounded-lg"
		>
			{children}
		</button>
	)
}
