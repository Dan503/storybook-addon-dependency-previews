import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { mealCards } from 'example-site-shared/data'
import { CardMoleculeComponent } from './CardMolecule.component'

const meta: Meta<CardMoleculeComponent> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<CardMoleculeComponent>

export const Primary: Story = {
	args: { ...mealCards[0], href: '/meal/123' },
	render: (args) => ({
		props: args,
		styles: ['.story-wrapper { width: 400px }'],
		template: `<div style="width: 400px"><app-card-molecule [title]="title" [imgSrc]="imgSrc" [description]="description" [href]="href" /></div>`,
	}),
}

export const FullWidth: Story = {
	args: { ...mealCards[0], href: '/meal/123' },
}
