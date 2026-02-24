import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ScreenPaddingAtom,
	type PropsForScreenPaddingAtom,
} from './ScreenPaddingAtom'
import { ChildContentAtom } from '../zz-meta-components/ChildContentAtom'

const meta: Meta<typeof ScreenPaddingAtom> = {
	title: '01 Atoms / Screen Padding Atom',
	component: ScreenPaddingAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		children: <ChildContentAtom />,
	} satisfies PropsForScreenPaddingAtom,
}
export const WithVerticalPadding: Story = {
	args: {
		children: <ChildContentAtom />,
		padVertical: true,
	} satisfies PropsForScreenPaddingAtom,
}
