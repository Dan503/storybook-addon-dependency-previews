import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	ContactTemplate,
	type PropsForContactTemplate,
} from './ContactTemplate'

const meta: Meta<typeof ContactTemplate> = {
	title: '04 Templates / Contact Template',
	component: ContactTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForContactTemplate,
}
