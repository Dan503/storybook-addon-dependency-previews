import type { Meta, StoryObj } from '@storybook/react-vite'
import { FooterOrganism, type PropsForFooterOrganism } from './FooterOrganism'

const meta: Meta<typeof FooterOrganism> = {
	title: '03 Organisms / Footer Organism',
	component: FooterOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForFooterOrganism,
}
