import { HeaderOrganism } from './HeaderOrganism'
import { FooterOrganism } from './FooterOrganism'
import type { JSX } from 'solid-js'

export interface PropsForSiteFrameOrganism {
	children?: JSX.Element
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
