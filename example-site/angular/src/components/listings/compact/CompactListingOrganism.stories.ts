import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { ingredientItems } from 'example-site-shared/data'
import { CompactListingOrganismComponent } from './CompactListingOrganism.component'

const meta: Meta<CompactListingOrganismComponent> = {
	title: 'Listings / Compact / Compact Listing Organism',
	component: CompactListingOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<CompactListingOrganismComponent>

export const Primary: Story = {
	args: { items: ingredientItems },
}
