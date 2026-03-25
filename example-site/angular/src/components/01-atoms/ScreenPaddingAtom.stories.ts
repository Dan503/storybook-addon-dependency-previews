import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ScreenPaddingAtomComponent } from './ScreenPaddingAtom.component';
import { ChildContentAtomComponent } from '../zz-meta-components/ChildContentAtom.component';

const meta: Meta<ScreenPaddingAtomComponent> = {
	title: '01 Atoms / Screen Padding Atom',
	component: ScreenPaddingAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ScreenPaddingAtomComponent>;

export const Primary: Story = {
	args: {},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ChildContentAtomComponent],
		},
		template: `
			<screen-padding-atom [class]="'border-2 border-dashed border-gray-400'">
				<child-content-atom />
			</screen-padding-atom>
		`,
	}),
};

export const WithVerticalPadding: Story = {
	args: {},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ChildContentAtomComponent],
		},
		template: `
			<screen-padding-atom [class]="'border-2 border-dashed border-gray-400'" [padVertical]="true">
				<child-content-atom />
			</screen-padding-atom>
		`,
	}),
};
