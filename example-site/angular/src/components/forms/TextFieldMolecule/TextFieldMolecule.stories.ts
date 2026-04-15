import { Component } from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { TextFieldMoleculeComponent } from './TextFieldMolecule.component';
import { FormDataMoleculeComponent } from '../../zz-meta-components/formDataPreview/FormDataMolecule.component';

@Component({
	selector: 'text-field-story-wrapper',
	standalone: true,
	imports: [TextFieldMoleculeComponent, FormDataMoleculeComponent],
	template: `
		<form-data-molecule [formValues]="formValues()">
			<text-field-molecule
				label="Name"
				placeholder="Your name"
				[tanstackField]="form"
				name="name"
			/>
		</form-data-molecule>
	`,
})
class TextFieldStoryWrapperComponent {
	form = injectForm({ defaultValues: { name: '' } });
	formValues = injectStore(this.form, (s) => s.values);
}

@Component({
	selector: 'text-field-error-story-wrapper',
	standalone: true,
	imports: [TextFieldMoleculeComponent, FormDataMoleculeComponent],
	template: `
		<form-data-molecule [formValues]="formValues()">
			<text-field-molecule
				label="Name"
				placeholder="Your name"
				[tanstackField]="form"
				name="name"
				[validators]="validators"
				[required]="true"
			/>
		</form-data-molecule>
	`,
})
class TextFieldErrorStoryWrapperComponent {
	form = injectForm({ defaultValues: { name: '' } });
	formValues = injectStore(this.form, (s) => s.values);

	validators = {
		onChange: ({ value }: { value: string }) =>
			!value
				? 'Name is required'
				: value.length < 2
					? 'Name must be at least 2 characters'
					: undefined,
	};
}

const meta: Meta<TextFieldMoleculeComponent> = {
	title: 'Forms / Text Field Molecule',
	component: TextFieldMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<TextFieldMoleculeComponent>;

export const Primary: Story = {
	decorators: [
		moduleMetadata({
			imports: [TextFieldStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<text-field-story-wrapper />',
	}),
};

export const ErrorState: Story = {
	decorators: [
		moduleMetadata({
			imports: [TextFieldErrorStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<text-field-error-story-wrapper />',
	}),
};
