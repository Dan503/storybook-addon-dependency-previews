import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ErrorBlockOrganismComponent } from './ErrorBlockOrganism.component'

const meta: Meta<ErrorBlockOrganismComponent> = {
	title: 'Forms / Error Messages / Error Block Organism',
	component: ErrorBlockOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ErrorBlockOrganismComponent>

export const Primary: Story = {
	args: {
		title: 'Please fix the following errors:',
		errors: ['Name is required', 'Email is invalid'],
	},
}
