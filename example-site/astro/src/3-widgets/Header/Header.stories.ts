import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import Header from './Header.astro'

export default {
	component: Header,
} satisfies Meta<typeof Header>

type Story = StoryObj<typeof Header>

export const Default: Story = {}
