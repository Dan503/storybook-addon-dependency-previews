import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { applicationConfig } from '@storybook/angular'
import { provideRouter } from '@angular/router'
import { SiteFrameOrganismComponent } from './SiteFrameOrganism.component'
import { ChildContentAtomComponent } from '../zz-meta-components/ChildContentAtom.component'

const meta: Meta<SiteFrameOrganismComponent> = {
	title: '03 Organisms / Site Frame Organism',
	component: SiteFrameOrganismComponent,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
}

export default meta

type Story = StoryObj<SiteFrameOrganismComponent>

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<app-site-frame-organism><app-child-content-atom /></app-site-frame-organism>`,
		moduleMetadata: { imports: [ChildContentAtomComponent] },
	}),
}
