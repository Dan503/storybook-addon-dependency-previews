import { Component } from '@angular/core'
import { ContactTemplateComponent } from '../../components/04-templates/ContactTemplate.component'

@Component({
	selector: 'app-contact-route',
	standalone: true,
	imports: [ContactTemplateComponent],
	template: `<app-contact-template />`,
})
export class ContactRouteComponent {}
