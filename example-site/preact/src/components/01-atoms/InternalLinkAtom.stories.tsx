import type { Meta, StoryObj } from '@storybook/preact-vite'
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

export const WithChangingPiece: Story = {
	args: {
		children: 'A single meal',
		href: '/meal/:mealId',
		hrefParams: { mealId: '52772' },
	} satisfies PropsForInternalLinkAtom,
}
