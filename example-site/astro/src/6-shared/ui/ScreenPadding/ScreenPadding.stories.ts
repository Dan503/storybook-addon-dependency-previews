import ChildContent from '../../storybook-only/ChildContent/ChildContent.astro'
import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import StoryContainer from '../../storybook-only/StoryContainer.astro'
import ScreenPadding from './ScreenPadding.astro'

export default {
	component: ScreenPadding,
	decorators: [StoryContainer],
} satisfies Meta<typeof ScreenPadding>

type Story = StoryObj<typeof ScreenPadding>

export const Default: Story = {
	args: {
		slots: { default: ChildContent },
	},
}

export const WithVerticalPadding: Story = {
	args: {
		padVertical: true,
		slots: { default: ChildContent },
	},
}
