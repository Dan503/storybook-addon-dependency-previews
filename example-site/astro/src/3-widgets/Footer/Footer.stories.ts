import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import Footer from './Footer.astro'

export default {
	component: Footer,
} satisfies Meta<typeof Footer>

type Story = StoryObj<typeof Footer>

export const Default: Story = {}
