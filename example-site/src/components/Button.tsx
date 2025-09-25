import * as React from 'react'

interface Props {
	onClick: () => void
	children: React.ReactNode
}

export function Button({ children, onClick }: Props) {
	return <button onClick={onClick}>{children}</button>
}
