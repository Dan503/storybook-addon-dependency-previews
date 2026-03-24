import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ButtonAtomComponent } from './ButtonAtom.component';

const meta: Meta<ButtonAtomComponent> = {
	title: '01 Atoms / Button Atom',
	component: ButtonAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ButtonAtomComponent>;

export const Primary: Story = {
	args: {
		onClick: () => alert('Button clicked!'),
	},
	render: (args) => ({
		props: args,
		template: `
			<button-atom
				[type]="type"
				[onClick]="onClick"
			>
				Click me
			</button-atom>
		`,
	}),
};
