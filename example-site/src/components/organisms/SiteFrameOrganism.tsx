import type { ReactNode } from 'react'
import { HeaderOrganism } from './HeaderOrganism'
import { FooterOrganism } from './FooterOrganism'

export interface PropsForSiteFrameOrganism {
	children?: ReactNode
}

export function SiteFrameOrganism({ children }: PropsForSiteFrameOrganism) {
	return (
		<div className="SiteFrameOrganism">
			<HeaderOrganism />
			{children}
			<FooterOrganism />
		</div>
	)
}
