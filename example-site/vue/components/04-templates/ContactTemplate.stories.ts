import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ContactTemplate from './ContactTemplate.vue'

const meta: Meta<typeof ContactTemplate> = {
	title: '04 Templates / Contact Template',
	component: ContactTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: () => ({
		components: { ContactTemplate },
		template: `<ContactTemplate />`,
	}),
}
