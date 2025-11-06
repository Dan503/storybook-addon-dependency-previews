import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ChildContentAtom,
	type PropsForChildContentAtom,
} from './ChildContentAtom'

const meta: Meta<typeof ChildContentAtom> = {
	title: 'Meta Components / Child Content Atom',
	component: ChildContentAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForChildContentAtom,
}
