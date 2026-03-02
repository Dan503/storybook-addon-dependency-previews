import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { ContactTemplateComponent } from './ContactTemplate.component'

const meta: Meta<ContactTemplateComponent> = {
	title: '04 Templates / Contact Template',
	component: ContactTemplateComponent,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [
		applicationConfig({ providers: [provideRouter([]), ReactiveFormsModule] }),
	],
}

export default meta

type Story = StoryObj<ContactTemplateComponent>

export const Primary: Story = {}
