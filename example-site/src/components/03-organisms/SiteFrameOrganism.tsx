import type { ReactNode } from 'react'
import { HeaderOrganism } from './HeaderOrganism'
import { FooterOrganism } from './FooterOrganism'

export interface PropsForSiteFrameOrganism {
	children?: ReactNode
}

export function SiteFrameOrganism({ children }: PropsForSiteFrameOrganism) {
	return (
		<div className="SiteFrameOrganism flex flex-col">
			<HeaderOrganism />
			<div className="flex-1 grid items-center">{children}</div>
			<FooterOrganism />
		</div>
	)
}
