import { CopyIcon } from './icons/CopyIcon'
import s from './CopyButton.module.css'
import { useState } from 'react'

interface Props {
	label: string
	copyContent: string
	copyMessage?: string
}

export function CopyButton({ label, copyContent, copyMessage }: Props) {
	const [clicked, setClicked] = useState(false)
	function copyContentToClipboard() {
		navigator.clipboard.writeText(copyContent)
		setClicked(true)
		setTimeout(() => setClicked(false), 2000)
	}
	return (
		<button
			className={s.CopyButton}
			title={label}
			onClick={copyContentToClipboard}
			data-copy-content={copyContent}
			data-clicked={clicked}
			data-copy-message={copyMessage || 'Copied to clipboard'}
		>
			<CopyIcon className={s.icon} />
		</button>
	)
}
