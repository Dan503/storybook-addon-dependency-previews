import { categoryList, exampleMealList } from 'example-site-shared/data'
import type {
	Meta,
	StoryObj,
} from '../../../6-shared/storybook-only/storybook.types'
import CategoryMealListPage from './CategoryMealListPage.astro'

export default {
	component: CategoryMealListPage,
} satisfies Meta<typeof CategoryMealListPage>

type Story = StoryObj<typeof CategoryMealListPage>

export const Default: Story = {
	args: {
		meals: exampleMealList,
	},
}
