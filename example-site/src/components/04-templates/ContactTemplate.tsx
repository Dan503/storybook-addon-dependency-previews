import { ContactFormOrganism } from '../forms/ContactFormOrganism/ContactFormOrganism'
import { IconTextMolecule } from '../02-molecules/IconTextMolecule'
import { PhoneIcon } from '../01-atoms/icons/PhoneIcon'
import { MapPinIcon } from '../01-atoms/icons/MapPinIcon'

export interface PropsForContactTemplate {}

export function ContactTemplate({}: PropsForContactTemplate) {
	return (
		<div className="ContactTemplate">
			<ContactFormOrganism />
			<p>
				<IconTextMolecule Icon={PhoneIcon}>0412 345 678</IconTextMolecule>
			</p>
			<p>
				<IconTextMolecule Icon={MapPinIcon}>
					123 Main St, Anytown, Australia
				</IconTextMolecule>
			</p>
		</div>
	)
}
