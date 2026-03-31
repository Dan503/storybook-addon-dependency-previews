import { Component } from '@angular/core'
import { injectForm } from '@tanstack/angular-form'
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { TextFieldMoleculeComponent } from './TextFieldMolecule.component'

@Component({
	selector: 'text-field-story-wrapper',
	standalone: true,
	imports: [TextFieldMoleculeComponent],
	template: `
		<text-field-molecule
			label="Name"
			placeholder="Your name"
			[tanstackField]="form"
			name="name"
		/>
	`,
})
class TextFieldStoryWrapperComponent {
	form = injectForm({ defaultValues: { name: '' } })
}

const meta: Meta<TextFieldMoleculeComponent> = {
	title: 'Forms / Text Field Molecule',
	component: TextFieldMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<TextFieldMoleculeComponent>

export const Primary: Story = {
	decorators: [
		moduleMetadata({
			imports: [TextFieldStoryWrapperComponent],
		}),
	],
	render: () => ({
		template: '<text-field-story-wrapper />',
	}),
}
