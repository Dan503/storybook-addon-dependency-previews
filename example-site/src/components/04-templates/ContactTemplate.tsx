import { ContactFormOrganism } from '../forms/ContactFormOrganism/ContactFormOrganism'
import { IconTextMolecule } from '../02-molecules/IconTextMolecule'
import { PhoneIcon } from '../01-atoms/icons/PhoneIcon'
import { MapPinIcon } from '../01-atoms/icons/MapPinIcon'
import { H, Section } from 'react-headings'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ContentRestraintAtom } from '../01-atoms/ContentRestraintAtom'

export interface PropsForContactTemplate {}

export function ContactTemplate({}: PropsForContactTemplate) {
	return (
		<SiteFrameOrganism>
			<div className="grid place-items-center h-full">
				<ContentRestraintAtom padVertical>
					<div className="ContactTemplate grid gap-4">
						<Section
							component={<H className="text-3xl font-bold">Contact Us</H>}
						>
							<IconTextMolecule Icon={PhoneIcon}>0412 345 678</IconTextMolecule>
							<IconTextMolecule Icon={MapPinIcon}>
								123 Main St, Anytown, Australia
							</IconTextMolecule>
							<ContactFormOrganism />
						</Section>
					</div>
				</ContentRestraintAtom>
			</div>
		</SiteFrameOrganism>
	)
}
