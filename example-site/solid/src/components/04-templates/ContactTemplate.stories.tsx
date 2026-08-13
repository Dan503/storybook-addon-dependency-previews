import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ContactTemplate } from './ContactTemplate'

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
