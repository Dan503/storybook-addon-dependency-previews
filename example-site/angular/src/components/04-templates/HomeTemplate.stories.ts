import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { featuredMealsData } from 'example-site-shared/data'
import { HomeTemplateComponent } from './HomeTemplate.component'

const meta: Meta<HomeTemplateComponent> = {
	title: '04 Templates / Home Template',
	component: HomeTemplateComponent,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<HomeTemplateComponent>

export const Primary: Story = {
	args: {
		featuredMeals: featuredMealsData,
	},
}
