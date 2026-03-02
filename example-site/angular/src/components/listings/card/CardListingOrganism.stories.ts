import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { mealCards } from 'example-site-shared/data'
import { CardListingOrganismComponent } from './CardListingOrganism.component'

const meta: Meta<CardListingOrganismComponent> = {
	title: 'Listings / Card / Card Listing Organism',
	component: CardListingOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<CardListingOrganismComponent>

export const Primary: Story = {
	args: {
		cards: mealCards.map((m) => ({ ...m, href: '/meal/123' })),
	},
}
