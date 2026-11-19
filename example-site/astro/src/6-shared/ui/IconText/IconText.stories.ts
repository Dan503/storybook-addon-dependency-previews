import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import MapPinIcon from '../Icons/MapPinIcon.astro'
import PhoneIcon from '../Icons/PhoneIcon.astro'
import IconText from './IconText.astro'

export default {
	component: IconText,
} satisfies Meta<typeof IconText>

type Story = StoryObj<typeof IconText>

export const Phone: Story = {
	args: {
		icon: PhoneIcon,
		ariaLabel: 'Phone number',
		slots: { default: '0412 345 678' },
	},
}

export const Address: Story = {
	args: {
		icon: MapPinIcon,
		ariaLabel: 'Address',
		slots: { default: '123 Main St, Anytown, Australia' },
	},
}
