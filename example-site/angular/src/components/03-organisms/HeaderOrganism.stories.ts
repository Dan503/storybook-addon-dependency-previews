import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { HeaderOrganismComponent } from './HeaderOrganism.component'

const meta: Meta<HeaderOrganismComponent> = {
	title: '03 Organisms / Header Organism',
	component: HeaderOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<HeaderOrganismComponent>

export const Default: Story = {}
