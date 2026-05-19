import { ContactTemplate } from './ContactTemplate'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'

const meta: Meta<typeof ContactTemplate> = {
	title: '04 Templates / Contact Template',
	component: ContactTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
