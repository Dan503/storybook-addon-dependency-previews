import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { exampleMeal } from 'example-site-shared/data'
import { DetailPageTemplateComponent } from './DetailPageTemplate.component'

const meta: Meta<DetailPageTemplateComponent> = {
	title: '04 Templates / Detail Page Template',
	component: DetailPageTemplateComponent,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<DetailPageTemplateComponent>

export const Primary: Story = {
	args: { meal: exampleMeal, isLoading: false },
}

export const Loading: Story = {
	args: { meal: undefined, isLoading: true },
}
