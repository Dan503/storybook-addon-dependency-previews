import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { ContactFormOrganismComponent } from './ContactFormOrganism.component'

const meta: Meta<ContactFormOrganismComponent> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ContactFormOrganismComponent>

export const Primary: Story = {}
