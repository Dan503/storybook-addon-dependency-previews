import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ErrorListMoleculeComponent } from './ErrorListMolecule.component';

const meta: Meta<ErrorListMoleculeComponent> = {
	title: 'Forms / Error Messages / Error List Molecule',
	component: ErrorListMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ErrorListMoleculeComponent>;

export const Primary: Story = {
	args: {
		errors: ['First error message.', new Error('Second error message.'), 'Third error message.'],
	},
};
