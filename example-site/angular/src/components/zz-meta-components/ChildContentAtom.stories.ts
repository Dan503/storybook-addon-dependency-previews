import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ChildContentAtomComponent } from './ChildContentAtom.component'

const meta: Meta<ChildContentAtomComponent> = {
	title: 'Zz Meta Components / Child Content Atom',
	component: ChildContentAtomComponent,
	tags: ["autodocs","atom"],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ChildContentAtomComponent>

export const Primary: Story = {
	args: {},
}
