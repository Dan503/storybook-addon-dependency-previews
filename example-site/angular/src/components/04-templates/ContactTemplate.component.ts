import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { ContactFormValues } from 'example-site-shared/data'
import { defaultContactFormValues } from 'example-site-shared/data'
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component'
import { ContentRestraintAtomComponent } from '../01-atoms/ContentRestraintAtom.component'
import { IconTextMoleculeComponent } from '../02-molecules/IconTextMolecule.component'
import { MapPinIconComponent } from '../01-atoms/icons/MapPinIcon.component'
import { PhoneIconComponent } from '../01-atoms/icons/PhoneIcon.component'
import { ContactFormOrganismComponent } from '../forms/ContactFormOrganism/ContactFormOrganism.component'
import { FormDataPreviewAtomComponent } from '../zz-meta-components/FormDataPreview/FormDataPreviewAtom.component'
import { ButtonAtomComponent } from '../01-atoms/ButtonAtom.component'

@Component({
	selector: 'app-contact-template',
	standalone: true,
	imports: [
		CommonModule,
		SiteFrameOrganismComponent,
		ContentRestraintAtomComponent,
		IconTextMoleculeComponent,
		MapPinIconComponent,
		PhoneIconComponent,
		ContactFormOrganismComponent,
		FormDataPreviewAtomComponent,
		ButtonAtomComponent,
	],
	templateUrl: './ContactTemplate.component.html',
})
export class ContactTemplateComponent {
	contactFormValues = signal<ContactFormValues>(defaultContactFormValues)
	isSubmitted = signal(false)

	onSubmit() {
		this.isSubmitted.set(true)
	}

	onValuesChange(values: ContactFormValues) {
		this.contactFormValues.set(values)
	}

	resetForm() {
		this.isSubmitted.set(false)
	}
}
