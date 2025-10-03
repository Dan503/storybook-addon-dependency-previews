import type { ReactNode } from 'react'
import { CopyButton } from './CopyButton'
import s from './PathCopyMolecule.module.css'

interface Props {
	label: string
	copyContent: string
	children: ReactNode
	copyLabel?: string
	copyMessage?: string
}

export function PathCopyMolecule({
	label,
	copyLabel = `Copy ${label} to clipboard`,
	copyMessage = `Copied ${label}!`,
	copyContent,
	children,
}: Props) {
	return (
		<p className={s.pathDataItem}>
			<strong>{label}: </strong>
			<br />
			<span className={s.pathLinkWrapper}>
				<CopyButton
					label={copyLabel}
					copyMessage={copyMessage}
					copyContent={copyContent}
				/>
				{children}
			</span>
		</p>
	)
}
