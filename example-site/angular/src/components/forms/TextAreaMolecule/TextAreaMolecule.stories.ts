import { Component } from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { TextAreaMoleculeComponent } from './TextAreaMolecule.component';
import { FormDataMoleculeComponent } from '../../zz-meta-components/formDataPreview/FormDataMolecule.component';

@Component({
	selector: 'text-area-story-wrapper',
	standalone: true,
	imports: [TextAreaMoleculeComponent, FormDataMoleculeComponent],
	template: `
		<form-data-molecule [formValues]="formValues()">
			<text-area-molecule
				label="Your message"
				placeholder="Type your message here..."
				[tanstackField]="form"
				name="message"
			/>
		</form-data-molecule>
	`,
})
class TextAreaStoryWrapperComponent {
	form = injectForm({ defaultValues: { message: '' } });
	formValues = injectStore(this.form, (s) => s.values);
}

@Component({
	selector: 'text-area-error-story-wrapper',
	standalone: true,
	imports: [TextAreaMoleculeComponent, FormDataMoleculeComponent],
	template: `
		<form-data-molecule [formValues]="formValues()">
			<text-area-molecule
				label="Your message"
				placeholder="Type your message here..."
				[tanstackField]="form"
				name="message"
				[validators]="validators"
				[required]="true"
			/>
		</form-data-molecule>
	`,
})
class TextAreaErrorStoryWrapperComponent {
	form = injectForm({ defaultValues: { message: '' } });
	formValues = injectStore(this.form, (s) => s.values);

	validators = {
		onChange: ({ value }: { value: string }) =>
			!value
				? 'Message is required'
				: value.length < 10
					? 'Message must be at least 10 characters'
					: undefined,
	};
}

const meta: Meta<TextAreaMoleculeComponent> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<TextAreaMoleculeComponent>;

export const Primary: Story = {
	decorators: [
		moduleMetadata({
			imports: [TextAreaStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<text-area-story-wrapper />',
	}),
};

export const ErrorState: Story = {
	decorators: [
		moduleMetadata({
			imports: [TextAreaErrorStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<text-area-error-story-wrapper />',
	}),
};
