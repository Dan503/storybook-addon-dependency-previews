import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ExternalLinkAtom,
	type PropsForExternalLinkAtom,
} from './ExternalLinkAtom'

const meta: Meta<typeof ExternalLinkAtom> = {
	title: '01 Atoms / External Link Atom',
	component: ExternalLinkAtom,
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
		children: 'Storybook Dependency Previews on GitHub',
		href: 'https://github.com/Dan503/storybook-addon-dependency-previews',
	} satisfies PropsForExternalLinkAtom,
}
