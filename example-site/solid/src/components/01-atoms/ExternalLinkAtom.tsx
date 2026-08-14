import type { JSX } from 'solid-js'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'

export interface PropsForExternalLinkAtom {
	href: string
	children?: JSX.Element
}

export function ExternalLinkAtom(props: PropsForExternalLinkAtom) {
	return (
		<a
			class="ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 hover:underline hover:text-teal-900"
			target="_blank"
			rel="noopener noreferrer"
			href={props.href}
			title="Opens in new tab"
		>
			{props.children}
			<ExternalLinkIcon />
		</a>
	)
}
