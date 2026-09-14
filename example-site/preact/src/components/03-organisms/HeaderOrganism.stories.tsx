import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { HeaderOrganism } from './HeaderOrganism'

const meta: Meta<typeof HeaderOrganism> = {
	title: '03 Organisms / Header Organism',
	component: HeaderOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {},
}
