import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	InternalLinkAtom,
	type PropsForInternalLinkAtom,
} from './InternalLinkAtom'

const meta: Meta<typeof InternalLinkAtom> = {
	title: '01 Atoms / Internal Link Atom',
	component: InternalLinkAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		children: 'Food categories',
		href: '/categories',
	} satisfies PropsForInternalLinkAtom,
}
