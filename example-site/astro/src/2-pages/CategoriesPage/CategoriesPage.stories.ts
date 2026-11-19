import { categoryList } from 'example-site-shared/data'
import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import CategoriesPage from './CategoriesPage.astro'

export default {
	component: CategoriesPage,
} satisfies Meta<typeof CategoriesPage>

type Story = StoryObj<typeof CategoriesPage>

export const Default: Story = {
	args: {
		categories: categoryList,
	},
}
