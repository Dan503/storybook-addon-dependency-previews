import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ContentRestraintAtomComponent } from './ContentRestraintAtom.component'
import { ChildContentAtomComponent } from '../zz-meta-components/ChildContentAtom.component'

const meta: Meta<ContentRestraintAtomComponent> = {
	title: '01 Atoms / Content Restraint Atom',
	component: ContentRestraintAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ContentRestraintAtomComponent>

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<app-content-restraint-atom><app-child-content-atom /></app-content-restraint-atom>`,
		moduleMetadata: { imports: [ChildContentAtomComponent] },
	}),
}
