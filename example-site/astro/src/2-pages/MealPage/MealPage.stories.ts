import { exampleMeal } from 'example-site-shared/data'
import type {
	Meta,
	StoryObj,
} from '../../6-shared/storybook-only/storybook.types'
import MealPage from './MealPage.astro'

export default {
	component: MealPage,
} satisfies Meta<typeof MealPage>

type Story = StoryObj<typeof MealPage>

export const Default: Story = {
	args: {
		meal: exampleMeal,
	},
}
