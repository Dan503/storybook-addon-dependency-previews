import type { ReactNode } from 'react'
import { HeaderOrganism } from './HeaderOrganism'
import { FooterOrganism } from './FooterOrganism'

export interface PropsForSiteFrameOrganism {
	children?: ReactNode
}

export function SiteFrameOrganism({ children }: PropsForSiteFrameOrganism) {
	return (
		<div className="SiteFrameOrganism grid grid-rows-[auto_1fr_auto] min-h-full">
			<HeaderOrganism />
			<div className="flex-1 grid">{children}</div>
			<FooterOrganism />
		</div>
	)
}
