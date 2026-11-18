import { exampleMeal } from 'example-site-shared/data'
import type {
	Meta,
	StoryObj,
} from '../../../6-shared/storybook-only/storybook.types'
import HeroBlock from './HeroBlock.astro'

export default {
	component: HeroBlock,
} satisfies Meta<typeof HeroBlock>

type Story = StoryObj<typeof HeroBlock>

export const Default: Story = {
	args: {
		bgSource: exampleMeal.image,
	},
}
