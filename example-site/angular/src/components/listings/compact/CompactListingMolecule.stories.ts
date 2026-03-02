import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { ingredientItems } from 'example-site-shared/data'
import { CompactListingMoleculeComponent } from './CompactListingMolecule.component'

const meta: Meta<CompactListingMoleculeComponent> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: CompactListingMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<CompactListingMoleculeComponent>

export const Primary: Story = {
	args: { ...ingredientItems[0] },
}
