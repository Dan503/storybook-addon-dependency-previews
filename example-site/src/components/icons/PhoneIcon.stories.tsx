import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhoneIcon } from './PhoneIcon'
import type { IconProps } from './iconTypes'

const meta: Meta<typeof PhoneIcon> = {
	title: 'Icons / Phone Icon',
	component: PhoneIcon,
	tags: ['autodocs', 'atom'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {} satisfies IconProps,
}
