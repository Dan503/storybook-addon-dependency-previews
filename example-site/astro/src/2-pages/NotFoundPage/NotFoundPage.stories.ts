import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import NotFoundPage from './NotFoundPage.astro'

export default {
	component: NotFoundPage,
} satisfies Meta<typeof NotFoundPage>

type Story = StoryObj<typeof NotFoundPage>

export const Default: Story = {}
