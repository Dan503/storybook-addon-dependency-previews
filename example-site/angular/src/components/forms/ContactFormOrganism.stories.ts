import { Component } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';
import { FormDataMoleculeComponent } from '../zz-meta-components/formDataPreview/FormDataMolecule.component';
import { ContactFormOrganismComponent } from './ContactFormOrganism.component';

@Component({
	selector: 'contact-form-story-wrapper',
	standalone: true,
	imports: [ContactFormOrganismComponent, FormDataMoleculeComponent],
	template: `
		<form-data-molecule [formValues]="formValues">
			<contact-form-organism (valuesChange)="formValues = $event" (onSubmit)="onSubmit()" />
		</form-data-molecule>
	`,
})
class ContactFormStoryWrapperComponent {
	formValues: ContactFormValues = defaultContactFormValues;

	onSubmit() {
		alert('Form submitted! with these values:\n' + JSON.stringify(this.formValues, null, 2));
	}
}

const meta: Meta<ContactFormOrganismComponent> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ContactFormOrganismComponent>;

export const Primary: Story = {
	decorators: [
		moduleMetadata({
			imports: [ContactFormStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<contact-form-story-wrapper />',
	}),
};
