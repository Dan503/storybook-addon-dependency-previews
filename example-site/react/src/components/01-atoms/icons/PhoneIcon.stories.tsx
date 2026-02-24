import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { PhoneIcon } from './PhoneIcon'
import type { IconProps } from './iconTypes'

const meta: Meta<typeof PhoneIcon> = {
	title: '01 Atoms / Icons / Phone Icon',
	component: PhoneIcon,
	tags: ['autodocs', 'atom', 'icon'],
	parameters: {
		layout: 'centered',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies IconProps,
}
