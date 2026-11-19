import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import MapPinIcon from './MapPinIcon.astro'

export default {
	component: MapPinIcon,
} satisfies Meta<typeof MapPinIcon>

type Story = StoryObj<typeof MapPinIcon>

export const Default: Story = {}

export const WithAltText: Story = {
	args: {
		altText: 'Address',
	},
}
