import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { MainNavMoleculeComponent } from './MainNavMolecule.component'

const meta: Meta<MainNavMoleculeComponent> = {
	title: '02 Molecules / Main Nav Molecule',
	component: MainNavMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [
		applicationConfig({ providers: [provideRouter([])] }),
	],
}

export default meta

type Story = StoryObj<MainNavMoleculeComponent>

export const Primary: Story = {}
