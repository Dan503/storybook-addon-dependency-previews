import { type Meta, type StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { SiteFrameOrganismComponent } from './SiteFrameOrganism.component';
import { ChildContentAtomComponent } from '../zz-meta-components/ChildContentAtom.component';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<SiteFrameOrganismComponent> = {
	title: '03 Organisms / Site Frame Organism',
	component: SiteFrameOrganismComponent,
	tags: ['autodocs', 'organism'],
	decorators: withSiteProviders,
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<SiteFrameOrganismComponent>;

export const Primary: Story = {
	args: {},
	render: (args) => ({
		template: `
			<site-frame-organism>
				<child-content-atom />
			</site-frame-organism>
		`,
		props: args,
		moduleMetadata: {
			imports: [SiteFrameOrganismComponent, ChildContentAtomComponent],
		},
	}),
};
