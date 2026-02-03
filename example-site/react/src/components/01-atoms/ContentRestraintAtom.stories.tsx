import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ContentRestraintAtom,
	type PropsForContentRestraintAtom,
} from './ContentRestraintAtom'
import { ChildContentAtom } from '../zz-meta-components/ChildContentAtom'

const meta: Meta<typeof ContentRestraintAtom> = {
	title: '01 Atoms / Content Restraint Atom',
	component: ContentRestraintAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		children: <ChildContentAtom />,
	} satisfies PropsForContentRestraintAtom,
}
