import {
	useEffect,
	useId,
	useState,
	type AnchorHTMLAttributes,
	type ReactNode,
} from 'react'

import s from './TooltipTrigger.module.css'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'

interface Props {
	TriggerElem: 'a' | 'button'
	onClick?: () => void
	href?: string
	children?: ReactNode
	className?: string
	tooltipText?: string
	newWindow?: boolean
	dangerouslySetInnerHTML?: AnchorHTMLAttributes<HTMLAnchorElement>['dangerouslySetInnerHTML']
}

export function TooltipTrigger({
	TriggerElem,
	onClick,
	children,
	className,
	tooltipText,
	href,
	newWindow,
	dangerouslySetInnerHTML,
}: Props) {
	const [isForcedShut, setIsForcedShut] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [isFocused, setIsFocused] = useState(false)
	const tooltipId = useId()

	useEffect(() => {
		function handler(e: KeyboardEvent) {
			if (e.key === 'Escape' && (isHovered || isFocused)) {
				e.stopPropagation()
				setIsForcedShut(true)
			}
		}
		document.addEventListener('keyup', handler)
		return () => document.removeEventListener('keyup', handler)
	}, [isHovered, isFocused])

	function onBlur() {
		setIsForcedShut(false)
		setIsFocused(false)
	}
	function onFocus() {
		setIsFocused(true)
	}
	function onMouseEnter() {
		setIsForcedShut(false)
		setIsHovered(true)
	}
	function onMouseLeave() {
		setIsHovered(false)
		if (isFocused) {
			setIsForcedShut(true)
		}
	}

	function onKeyUp(e: React.KeyboardEvent) {
		if (!onClick) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onClick()
		}
	}

	return (
		<span className={s.wrapper}>
			{TriggerElem === 'button' && (
				<button
					onClick={onClick}
					onKeyUp={onKeyUp}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onFocus={onFocus}
					onBlur={onBlur}
					aria-describedby={tooltipId}
					className={[className, s.TriggerElem].join(' ')}
					dangerouslySetInnerHTML={dangerouslySetInnerHTML}
				>
					{children}
				</button>
			)}
			{TriggerElem === 'a' && (
				<a
					href={href}
					onClick={onClick}
					onKeyUp={onKeyUp}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onFocus={onFocus}
					onBlur={onBlur}
					aria-describedby={tooltipId}
					className={[className, s.TriggerElem].join(' ')}
					target={newWindow ? '_blank' : undefined}
					rel={newWindow ? 'noreferrer' : undefined}
				>
					<span style={{ whiteSpace: 'nowrap' }}>
						{dangerouslySetInnerHTML ? (
							<span
								style={{ whiteSpace: 'initial' }}
								dangerouslySetInnerHTML={
									dangerouslySetInnerHTML
								}
							/>
						) : (
							<span style={{ whiteSpace: 'initial' }}>
								{children}
							</span>
						)}
						{newWindow && (
							<>
								&nbsp;
								<ExternalLinkIcon
									className={s.externalLinkIcon}
								/>
							</>
						)}
					</span>
				</a>
			)}

			<span
				id={tooltipId}
				className={s.tooltip}
				aria-hidden="true"
				data-force-closed={isForcedShut}
			>
				{tooltipText}
			</span>
		</span>
	)
}
