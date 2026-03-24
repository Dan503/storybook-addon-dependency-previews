import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { MapPinIconComponent } from './MapPinIcon.component';

const meta: Meta<MapPinIconComponent> = {
	title: '01 Atoms / Icons / Map Pin Icon',
	component: MapPinIconComponent,
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
