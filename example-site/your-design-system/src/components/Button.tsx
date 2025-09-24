import { ReactNode } from 'react'

interface Props {
	onClick: () => void
	children: ReactNode
}

export function Button({ children, onClick }: Props) {
	return <button onClick={onClick}>{children}</button>
}
