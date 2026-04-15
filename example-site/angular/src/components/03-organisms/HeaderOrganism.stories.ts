import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { HeaderOrganismComponent } from './HeaderOrganism.component';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<HeaderOrganismComponent> = {
	title: '03 Organisms / Header Organism',
	component: HeaderOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: withSiteProviders,
};

export default meta;

type Story = StoryObj<HeaderOrganismComponent>;

export const Primary: Story = {
	args: {},
};
