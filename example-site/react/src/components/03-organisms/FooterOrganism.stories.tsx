import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FooterOrganism, type PropsForFooterOrganism } from './FooterOrganism'

const meta: Meta<typeof FooterOrganism> = {
	title: '03 Organisms / Footer Organism',
	component: FooterOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForFooterOrganism,
}
