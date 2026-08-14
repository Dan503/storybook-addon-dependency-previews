import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { PhoneIcon } from './PhoneIcon'

const meta: Meta<typeof PhoneIcon> = {
	title: '01 Atoms / Icons / Phone Icon',
	component: PhoneIcon,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
