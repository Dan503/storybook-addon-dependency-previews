import {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type AnchorHTMLAttributes,
	type ReactNode,
} from 'react'

import s from './TooltipTrigger.module.css'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'
import { useElemDimensions } from '../hooks/useElemDimensions'
import { createPortal } from 'react-dom'
import { useAnimatedMount } from '../hooks/useAnimatedMount'

interface Props {
	TriggerElem: 'a' | 'button'
	onClick?: (event: React.MouseEvent) => void
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

	const isOpen = (isHovered || isFocused) && !isForcedShut

	const {
		rect: aRect,
		ref: aRef,
		updateRect: updateARect,
	} = useElemDimensions<HTMLAnchorElement>(isOpen)
	const {
		rect: buttonRect,
		ref: buttonRef,
		updateRect: updateButtonRect,
	} = useElemDimensions<HTMLButtonElement>(isOpen)

	const { isRendered, animationState } = useAnimatedMount(isOpen, 180)

	const rect = TriggerElem === 'a' ? aRect : buttonRect
	const updateRect = TriggerElem === 'a' ? updateARect : updateButtonRect

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
		updateRect()
		setIsFocused(true)
	}
	function onMouseEnter() {
		updateRect()
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
			onClick?.(e as any)
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
					ref={buttonRef}
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
					ref={aRef}
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

			{isRendered &&
				rect &&
				createPortal(
					<span
						id={tooltipId}
						className={s.tooltip}
						aria-hidden="true"
						data-animation-state={animationState}
						data-force-closed={isForcedShut}
						style={{
							position: 'fixed',
							bottom: rect.bottom / 2,
							left: rect.left + rect.width / 2,
							transform:
								'translateX(-50%) translateY(calc(-100% - 0.5em))',
							zIndex: 9999,
						}}
					>
						{tooltipText}
					</span>,
					document.body,
				)}
		</span>
	)
}
