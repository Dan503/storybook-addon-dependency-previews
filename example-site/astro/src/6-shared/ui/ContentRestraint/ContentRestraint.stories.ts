import ChildContent from '../../storybook-only/ChildContent/ChildContent.astro'
import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import StoryContainer from '../../storybook-only/StoryContainer.astro'
import ContentRestraint from './ContentRestraint.astro'

export default {
	component: ContentRestraint,
	decorators: [StoryContainer],
} satisfies Meta<typeof ContentRestraint>

type Story = StoryObj<typeof ContentRestraint>

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
