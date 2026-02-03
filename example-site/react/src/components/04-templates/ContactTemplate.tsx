import { useState } from 'react'
import { H, Section } from 'react-headings'
import { ContentRestraintAtom } from '../01-atoms/ContentRestraintAtom'
import { MapPinIcon } from '../01-atoms/icons/MapPinIcon'
import { PhoneIcon } from '../01-atoms/icons/PhoneIcon'
import { IconTextMolecule } from '../02-molecules/IconTextMolecule'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import {
	ContactFormOrganism,
	defaultContactFormValues,
} from '../forms/ContactFormOrganism/ContactFormOrganism'
import { FormDataPreviewAtom } from '../forms/FormDataPreview/FormDataPreviewAtom'
import { ButtonAtom } from '../01-atoms/ButtonAtom'

export interface PropsForContactTemplate {}

export function ContactTemplate({}: PropsForContactTemplate) {
	const [contactFormValues, setContactFormValues] = useState(
		defaultContactFormValues,
	)
	const [isSubmitted, setIsSubmitted] = useState(false)
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
							{isSubmitted ? (
								<div className="grid gap-4">
									<p>Thank you for your message!</p>
									<p>
										This website is just a demo so your message was not sent
										anywhere.
									</p>
									<p>Here is what you submitted:</p>
									<FormDataPreviewAtom formValues={contactFormValues} />
									<div className="flex justify-start">
										<ButtonAtom onClick={() => setIsSubmitted(false)}>
											Back to the contact form
										</ButtonAtom>
									</div>
								</div>
							) : (
								<ContactFormOrganism
									onSubmit={() => {
										setIsSubmitted(true)
									}}
									onValuesChange={setContactFormValues}
								/>
							)}
						</Section>
					</div>
				</ContentRestraintAtom>
			</div>
		</SiteFrameOrganism>
	)
}
