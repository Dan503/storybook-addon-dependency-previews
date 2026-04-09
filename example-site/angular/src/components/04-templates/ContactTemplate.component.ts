import { Component, input } from '@angular/core';
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component';
import { ContentRestraintAtomComponent } from '../01-atoms/ContentRestraintAtom.component';
import { IconTextMoleculeComponent } from '../02-molecules/IconTextMolecule.component';
import { FormDataPreviewAtomComponent } from '../zz-meta-components/formDataPreview/FormDataPreviewAtom.component';
import { ButtonAtomComponent } from '../01-atoms/ButtonAtom.component';
import { ContactFormOrganismComponent } from '../forms/ContactFormOrganism.component';
import { PhoneIconComponent } from '../01-atoms/icons/PhoneIcon.component';
import { MapPinIconComponent } from '../01-atoms/icons/MapPinIcon.component';
import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';

@Component({
	selector: 'contact-template',
	host: { '[class]': '["ContactTemplate", class()].join(" ")' },
	template: `
		<site-frame-organism>
			<div class="grid h-full place-items-center">
				<content-restraint-atom [padVertical]="true">
					<div class="grid gap-4">
						<h1 class="text-3xl font-bold">Contact Us</h1>
						<icon-text-molecule [icon]="phoneIcon" [text]="'0412 345 678'" />
						<icon-text-molecule
							[icon]="mapPinIcon"
							[text]="'123 Main St, Anytown, Australia'"
						/>

						@if (isSubmitted) {
							<div class="grid gap-4">
								<p>Thank you for your message!</p>
								<p>This website is just a demo so your message was not sent anywhere.</p>
								<p>Here is what you submitted:</p>
								<form-data-preview-atom [formValues]="contactFormValues" />

								<div class="flex justify-start">
									<button-atom type="button" [onClick]="onBackClick">
										Back to the contact form
									</button-atom>
								</div>
							</div>
						} @else {
							<contact-form-organism
								(valuesChange)="valuesChange($event)"
								(onSubmit)="onSubmit()"
							/>
						}
					</div>
				</content-restraint-atom>
			</div>
		</site-frame-organism>
	`,
	standalone: true,
	imports: [
		SiteFrameOrganismComponent,
		ContentRestraintAtomComponent,
		IconTextMoleculeComponent,
		FormDataPreviewAtomComponent,
		ButtonAtomComponent,
		ContactFormOrganismComponent,
	],
})
export class ContactTemplateComponent {
	class = input<string>('');
	protected phoneIcon = PhoneIconComponent;
	protected mapPinIcon = MapPinIconComponent;
	protected isSubmitted = false;
	protected onBackClick = () => (this.isSubmitted = false);
	protected onSubmit = () => (this.isSubmitted = true);
	contactFormValues: ContactFormValues = defaultContactFormValues;
	valuesChange = (values: ContactFormValues) => (this.contactFormValues = values);
}
