import type {
	Meta,
	StoryObj,
} from '../../../6-shared/storybook-only/storybook.types'
import Nav from './Nav.astro'

export default {
	component: Nav,
} satisfies Meta<typeof Nav>

type Story = StoryObj<typeof Nav>

export const Default: Story = {}
