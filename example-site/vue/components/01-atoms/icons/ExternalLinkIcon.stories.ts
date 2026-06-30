import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ExternalLinkIcon, {
	type PropsForExternalLinkIcon,
} from './ExternalLinkIcon.vue'

const meta: Meta<typeof ExternalLinkIcon> = {
	title: '01 Atoms / Icons / External Link Icon',
	component: ExternalLinkIcon,
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'centered',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForExternalLinkIcon,
}

export const WithAltTextAndColour: Story = {
	args: {
		altText: 'Open in new tab',
		className: 'text-blue-500',
	} satisfies PropsForExternalLinkIcon,
}
