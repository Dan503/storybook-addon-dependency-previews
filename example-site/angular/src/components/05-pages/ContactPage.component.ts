import { Component } from '@angular/core';
import { ContactTemplateComponent } from '../04-templates/ContactTemplate.component';

@Component({
	selector: 'contact-page',
	template: `<contact-template />`,
	standalone: true,
	imports: [ContactTemplateComponent],
})
export class ContactPageComponent {}
