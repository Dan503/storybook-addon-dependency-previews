import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { PhoneIconComponent } from './PhoneIcon.component';

const meta: Meta<PhoneIconComponent> = {
	title: '01 Atoms / Icons / Phone Icon',
	component: PhoneIconComponent,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'centered',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {},
};
