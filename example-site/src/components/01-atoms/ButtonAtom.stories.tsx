import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ButtonAtom, type PropsForButtonAtom } from './ButtonAtom'

const meta: Meta<typeof ButtonAtom> = {
	title: '01 Atoms / Button Atom',
	component: ButtonAtom,
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
		children: 'Click Me',
		onClick() {
			alert('Button clicked!')
		},
	} satisfies PropsForButtonAtom,
}
