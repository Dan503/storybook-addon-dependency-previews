import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { FormDataPreviewAtomComponent } from './FormDataPreviewAtom.component';

const meta: Meta<FormDataPreviewAtomComponent> = {
	title: 'Zz Meta Components / Form Data Preview / Form Data Preview Atom',
	component: FormDataPreviewAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<FormDataPreviewAtomComponent>;

const sampleFormValues = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john.doe@example.com',
};

export const Primary: Story = {
	args: {
		formValues: sampleFormValues,
	},
};
