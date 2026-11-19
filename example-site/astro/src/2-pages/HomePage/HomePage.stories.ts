import { exampleMeal, exampleMealList } from 'example-site-shared/data'
import HomePage from './HomePage.astro'
import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'

export default {
	component: HomePage,
} satisfies Meta<typeof HomePage>

type Story = StoryObj<typeof HomePage>

export const Default: Story = {
	args: {
		heroBgImg: exampleMeal.image,
		featuredMeals: exampleMealList,
	},
}
