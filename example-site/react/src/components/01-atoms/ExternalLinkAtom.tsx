import type { ReactNode } from 'react'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'

export interface PropsForExternalLinkAtom {
	href: string
	children?: ReactNode
}

export function ExternalLinkAtom({ href, children }: PropsForExternalLinkAtom) {
	return (
		<a
			className="ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 hover:underline hover:text-teal-900"
			target="_blank"
			rel="noopener noreferrer"
			href={href}
			title="Opens in new tab"
		>
			{children}
			<ExternalLinkIcon />
		</a>
	)
}
