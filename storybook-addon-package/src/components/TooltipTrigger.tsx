import {
	useEffect,
	useId,
	useRef,
	useState,
	type AnchorHTMLAttributes,
	type ReactNode,
} from 'react'

import s from './TooltipTrigger.module.css'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'

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
	const triggerId = useId()
	const tipId = useId()
	const tipRef = useRef<HTMLDivElement | null>(null)

	function show() {
		;(tipRef.current as any)?.showPopover?.()
	}
	function hide() {
		;(tipRef.current as any)?.hidePopover?.()
	}

	const common = {
		id: triggerId,
		onClick,
		onFocus: show,
		onBlur: hide,
		onMouseEnter: show,
		onMouseLeave: hide,
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation()
				hide()
			}
		},
		'aria-describedby': tipId, // announce on focus for keyboard users
		className: [className, s.TriggerElem].filter(Boolean).join(' '),
	}

	return (
		<span data-anchor-name={triggerId + tipId}>
			{TriggerElem === 'button' ? (
				<button
					type="button"
					{...common}
					dangerouslySetInnerHTML={dangerouslySetInnerHTML as any}
				>
					{!dangerouslySetInnerHTML && children}
				</button>
			) : (
				<a
					href={href}
					target={newWindow ? '_blank' : undefined}
					rel={newWindow ? 'noreferrer' : undefined}
					{...(common as any)}
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
								{' '}
								&nbsp;
								<ExternalLinkIcon
									className={s.externalLinkIcon}
								/>
							</>
						)}
					</span>
				</a>
			)}

			{/* Top-layer, CSS-anchored tooltip (no rect) */}
			<span
				id={tipId}
				ref={tipRef}
				popover="auto"
				role="tooltip"
				className={s.popover}
				data-popover-anchor={triggerId + tipId}
				// {...{ anchor: triggerId + tipId }} // <-- anchor to the trigger by id
			>
				{tooltipText}
			</span>
		</span>
	)
}
