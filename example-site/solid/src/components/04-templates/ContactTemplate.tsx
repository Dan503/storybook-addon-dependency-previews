import { createSignal } from 'solid-js'
import { ContentRestraintAtom } from '../01-atoms/ContentRestraintAtom'
import { MapPinIcon } from '../01-atoms/icons/MapPinIcon'
import { PhoneIcon } from '../01-atoms/icons/PhoneIcon'
import { IconTextMolecule } from '../02-molecules/IconTextMolecule'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ContactFormOrganism } from '../forms/ContactFormOrganism/ContactFormOrganism'
import { createContactForm } from '../forms/ContactFormOrganism/createContactForm'
import { FormDataPreviewAtom } from '../forms/FormDataPreview/FormDataPreviewAtom'
import { ButtonAtom } from '../01-atoms/ButtonAtom'

export function ContactTemplate() {
	const contactForm = createContactForm()
	const [isSubmitted, setIsSubmitted] = createSignal(false)
	return (
		<SiteFrameOrganism>
			<div class="grid place-items-center h-full">
				<ContentRestraintAtom padVertical>
					<div class="ContactTemplate grid gap-4">
						<h1 class="text-3xl font-bold">Contact Us</h1>
						<IconTextMolecule Icon={PhoneIcon}>0412 345 678</IconTextMolecule>
						<IconTextMolecule Icon={MapPinIcon}>
							123 Main St, Anytown, Australia
						</IconTextMolecule>
						{isSubmitted() ? (
							<div class="grid gap-4">
								<p>Thank you for your message!</p>
								<p>
									This website is just a demo so your message was not sent
									anywhere.
								</p>
								<p>Here is what you submitted:</p>
								<FormDataPreviewAtom form={contactForm} />
								<div class="flex justify-start">
									<ButtonAtom onClick={() => setIsSubmitted(false)}>
										Back to the contact form
									</ButtonAtom>
								</div>
							</div>
						) : (
							<ContactFormOrganism
								form={contactForm}
								onSubmit={() => {
									setIsSubmitted(true)
								}}
							/>
						)}
					</div>
				</ContentRestraintAtom>
			</div>
		</SiteFrameOrganism>
	)
}
