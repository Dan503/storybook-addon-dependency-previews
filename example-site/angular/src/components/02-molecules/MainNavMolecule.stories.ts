import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { MainNavMoleculeComponent } from './MainNavMolecule.component'

const meta: Meta<MainNavMoleculeComponent> = {
	title: '02 Molecules / Main Nav Molecule',
	component: MainNavMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<MainNavMoleculeComponent>

export const Primary: Story = {
	args: {},
}
