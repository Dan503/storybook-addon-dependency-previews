import { useId, useRef, useState } from 'react'
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
	const tooltipId = useId()
	const srId = useId()
	const resultMessageId = useId()
	const btnRef = useRef<HTMLButtonElement | null>(null)

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
	}
	function onMouseLeave() {
		reset()
	}
	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onCopy()
		}
		if (e.key === 'Escape') {
			e.stopPropagation()
			reset()
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
				onBlur={onBlur}
				onMouseLeave={onMouseLeave}
				onKeyDown={onKeyDown}
				aria-label={label}
				aria-describedby={isResultOpen ? resultMessageId : undefined}
			>
				<CopyIcon className={s.icon} />
			</button>

			<span id={tooltipId} className={s.tooltip} aria-hidden="true">
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
