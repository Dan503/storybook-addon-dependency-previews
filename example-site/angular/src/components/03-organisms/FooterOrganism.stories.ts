import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FooterOrganismComponent } from './FooterOrganism.component'

const meta: Meta<FooterOrganismComponent> = {
	title: '03 Organisms / Footer Organism',
	component: FooterOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<FooterOrganismComponent>

export const Primary: Story = {}
