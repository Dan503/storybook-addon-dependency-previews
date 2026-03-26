import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { MainNavMoleculeComponent } from './MainNavMolecule.component';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<MainNavMoleculeComponent> = {
	title: '02 Molecules / Main Nav Molecule',
	component: MainNavMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	decorators: withSiteProviders,
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<MainNavMoleculeComponent>;

export const Primary: Story = {
	args: {},
};
