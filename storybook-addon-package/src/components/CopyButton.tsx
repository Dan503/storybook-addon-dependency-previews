import { useEffect, useId, useRef, useState } from 'react'
import { CopyIcon } from './icons/CopyIcon'
import s from './CopyButton.module.css'

type Status = 'idle' | 'copied' | 'error'

interface Props {
	label: string
	copyContent: string
	copyMessage?: string
	errorMessage?: string
}

export function CopyButton({
	label,
	copyContent,
	copyMessage = 'Copied to clipboard',
	errorMessage = 'Copy failed',
}: Props) {
	const [status, setStatus] = useState<Status>('idle')
	const [isResultOpen, setResultOpen] = useState(false)
	const [isForcedShut, setIsForcedShut] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [isFocused, setIsFocused] = useState(false)
	const tooltipId = useId()
	const srId = useId()
	const resultMessageId = useId()
	const btnRef = useRef<HTMLButtonElement | null>(null)

	useEffect(() => {
		function handler(e: KeyboardEvent) {
			console.log('keydown', e.key, isHovered)
			// if btnRef is hovered over and escape key is pressed
			if (e.key === 'Escape' && (isHovered || isFocused)) {
				e.stopPropagation()
				reset()
				setIsForcedShut(true)
			}
		}
		document.addEventListener('keyup', handler)
		return () => document.removeEventListener('keyup', handler)
	}, [isHovered, isFocused])

	async function onCopy() {
		try {
			await navigator.clipboard.writeText(copyContent)
			setStatus('copied')
			setResultOpen(true)
		} catch {
			setStatus('error')
			setResultOpen(true)
		}
	}
	function reset() {
		setStatus('idle')
		setResultOpen(false)
	}

	function onBlur() {
		reset()
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
		reset()
		if (isFocused) {
			setIsForcedShut(true)
		}
	}
	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onCopy()
		}
	}

	const copyResultMessage = {
		error: errorMessage,
		copied: copyMessage,
		idle: '',
	}[status]

	return (
		<span className={s.wrapper}>
			<button
				ref={btnRef}
				type="button"
				className={s.CopyButton}
				onClick={onCopy}
				onFocus={onFocus}
				onBlur={onBlur}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onKeyDown={onKeyDown}
				aria-label={label}
				aria-describedby={isResultOpen ? resultMessageId : undefined}
			>
				<CopyIcon className={s.icon} />
			</button>

			<span
				id={tooltipId}
				className={s.tooltip}
				aria-hidden="true"
				data-force-closed={isForcedShut}
			>
				{copyResultMessage || label}
			</span>

			<span
				id={srId}
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className={s.srOnly}
			>
				{copyResultMessage}
			</span>
		</span>
	)
}
