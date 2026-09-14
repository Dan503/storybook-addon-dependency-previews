import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { featuredMealsData } from 'example-site-shared/data'
import { HomeTemplate, type PropsForHomeTemplate } from './HomeTemplate'

const meta: Meta<typeof HomeTemplate> = {
	title: '04 Templates / Home Template',
	component: HomeTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		featuredMeals: {
			mapping: {
				featured: featuredMealsData,
				none: [],
			},
			control: {
				type: 'select',
			},
			options: ['featured', 'none'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		featuredMeals:
			'featured' as unknown as PropsForHomeTemplate['featuredMeals'],
	},
}

/**
 * What the page looks like before its meals arrive. The site's home page asks
 * the meal database for a random seven once the page is on screen, so this is
 * the state it starts in every visit.
 */
export const BeforeMealsArrive: Story = {
	args: {
		featuredMeals: 'none' as unknown as PropsForHomeTemplate['featuredMeals'],
	},
}
