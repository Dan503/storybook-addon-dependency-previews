import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ContentRestraintAtomComponent } from './ContentRestraintAtom.component';

const meta: Meta<ContentRestraintAtomComponent> = {
	title: '01 Atoms / Content Restraint Atom',
	component: ContentRestraintAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ContentRestraintAtomComponent>;

export const Primary: Story = {
	args: {},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ContentRestraintAtomComponent],
		},
		template: `
			<content-restraint-atom [class]="'border-2 border-dashed border-gray-400'">
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
				</p>
			</content-restraint-atom>
		`,
	}),
};

export const WithVerticalPadding: Story = {
	args: {},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ContentRestraintAtomComponent],
		},
		template: `
			<content-restraint-atom [class]="'border-2 border-dashed border-gray-400'" [padVertical]="true">
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
				</p>
			</content-restraint-atom>
		`,
	}),
};
