import { useState, type ReactNode } from 'react'
import s from './Expandable.module.css'
import { EyeOpen } from './icons/EyeOpen'
import { X } from './icons/X'

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
			<summary className={s.header}>
				{isOpen ? (
					<X className={s.icon} />
				) : (
					<EyeOpen className={s.icon} />
				)}
				<div className={s.headContent}>{Header}</div>
			</summary>
			{isOpen && <div className={s.body}>{children}</div>}
		</details>
	)
}
