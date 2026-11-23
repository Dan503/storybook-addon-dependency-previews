import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import HiddenNavLink from './HiddenNavLink.astro'

export default {
	component: HiddenNavLink,
} satisfies Meta<typeof HiddenNavLink>

type Story = StoryObj<typeof HiddenNavLink>

export const Default: Story = {
	args: {
		anchor: 'main',
		slots: { default: 'Visually hidden link' },
	},
}
