import { useState, type ReactElement, type ReactNode } from 'react'
import s from './Expandable.module.css'

interface PropsForExpandable {
	Header: ReactNode
	children: ReactNode
	onToggle?: (toggleState: boolean) => void
}
export function Expandable({ onToggle, Header, children }: PropsForExpandable) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<details
			className={s.container}
			onToggle={(e) => {
				e.stopPropagation()
				onToggle?.(e.currentTarget.open)
				setIsOpen(e.currentTarget.open)
			}}
		>
			<summary className={s.header}>{Header}</summary>
			{isOpen && <div className={s.body}>{children}</div>}
		</details>
	)
}
