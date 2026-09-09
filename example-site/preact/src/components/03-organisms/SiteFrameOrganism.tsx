import type { ComponentChildren } from 'preact'
import { HeaderOrganism } from './HeaderOrganism'
import { FooterOrganism } from './FooterOrganism'

export interface PropsForSiteFrameOrganism {
	children?: ComponentChildren
}

export function SiteFrameOrganism({ children }: PropsForSiteFrameOrganism) {
	return (
		<div class="SiteFrameOrganism grid grid-rows-[auto_1fr_auto] min-h-full">
			<HeaderOrganism />
			<div class="flex-1 grid">{children}</div>
			<FooterOrganism />
		</div>
	)
}
