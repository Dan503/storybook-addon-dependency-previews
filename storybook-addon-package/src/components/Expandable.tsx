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
				const isTogglingToOpen = e.currentTarget.open
				const isAnimationSupported =
					CSS.supports('interpolate-size', 'allow-keywords') &&
					CSS.supports('transition-behavior', 'allow-discrete')
				onToggle?.(isTogglingToOpen)

				// since we unmount on close we need to delay the unmount when the accordion is closing
				if (isAnimationSupported) {
					if (isTogglingToOpen) {
						setIsOpen(isTogglingToOpen)
					} else {
						setTimeout(() => {
							setIsOpen(isTogglingToOpen)
						}, 0.3 * 1000)
					}
				} else {
					setIsOpen(isTogglingToOpen)
				}
			}}
		>
			<summary className={s.header}>
				{/* Need to handle show/hide of icons with CSS since isOpen has a delay on close */}
				<X className={`${s.icon} ${s.XIcon}`} />
				<EyeOpen className={`${s.icon} ${s.EyeIcon}`} />
				<div className={s.headContent}>{Header}</div>
			</summary>
			{isOpen && <div className={s.body}>{children}</div>}
		</details>
	)
}
