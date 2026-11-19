import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import ContactPage from './ContactPage.astro'

export default {
	component: ContactPage,
} satisfies Meta<typeof ContactPage>

type Story = StoryObj<typeof ContactPage>

export const Default: Story = {}
