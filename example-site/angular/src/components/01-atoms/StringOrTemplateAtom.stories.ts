import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { StringOrTemplateAtomComponent } from './StringOrTemplateAtom.component';

const meta: Meta<StringOrTemplateAtomComponent> = {
	title: '01 Atoms / String Or Template Atom',
	component: StringOrTemplateAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<StringOrTemplateAtomComponent>;

export const TemplateVersion: Story = {
	render: () => ({
		template: `
			<ng-template #titleTemplate>
				<span class="text-red-800">This is a template</span>
			</ng-template>
			<string-or-template-atom [value]="titleTemplate" />
		`,
	}),
};

export const StringVersion: Story = {
	args: {
		value: 'This is a string',
	},
};
