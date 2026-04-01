import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { FormDataMoleculeComponent } from './FormDataMolecule.component';
import { ChildContentAtomComponent } from '../ChildContentAtom.component';

const meta: Meta<FormDataMoleculeComponent> = {
	title: 'Zz Meta Components / Form Data Preview / Form Data Molecule',
	component: FormDataMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<FormDataMoleculeComponent>;

const sampleFormValues = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john.doe@example.com',
};

export const Primary: Story = {
	args: {
		formValues: sampleFormValues,
	},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ChildContentAtomComponent],
		},
		template: `
			<form-data-molecule [formValues]="formValues">
				<child-content-atom />
			</form-data-molecule>
		`,
	}),
};
