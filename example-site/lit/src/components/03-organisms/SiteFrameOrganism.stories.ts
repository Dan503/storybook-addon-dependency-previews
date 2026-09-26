import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import '../zz-meta-components/ChildContentAtom.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './SiteFrameOrganism.lit'
import type { SiteFrameOrganism } from './SiteFrameOrganism.lit'

const meta: Meta<SiteFrameOrganism> = {
	title: '03 Organisms / Site Frame Organism',
	component: 'app-site-frame-organism',
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: () =>
		html`<app-site-frame-organism>
			<app-child-content-atom></app-child-content-atom>
		</app-site-frame-organism>`,
}

export default meta

type Story = StoryObj<SiteFrameOrganism>

export const Primary: Story = {}
