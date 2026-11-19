import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import PhoneIcon from './PhoneIcon.astro'

export default {
	component: PhoneIcon,
} satisfies Meta<typeof PhoneIcon>

type Story = StoryObj<typeof PhoneIcon>

export const Default: Story = {}

export const WithAltText: Story = {
	args: {
		altText: 'Phone',
	},
}
