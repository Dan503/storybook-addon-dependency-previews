import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ExternalLinkIcon } from './ExternalLinkIcon'
import type { IconProps } from './iconTypes'

const meta: Meta<typeof ExternalLinkIcon> = {
	title: '01 Atoms / Icons / External Link Icon',
	component: ExternalLinkIcon,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies IconProps,
}
