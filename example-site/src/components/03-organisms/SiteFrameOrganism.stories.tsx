import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	SiteFrameOrganism,
	type PropsForSiteFrameOrganism,
} from './SiteFrameOrganism'
import { ChildContentAtom } from '../meta-components/ChildContentAtom'

const meta: Meta<typeof SiteFrameOrganism> = {
	title: 'Organisms / Site Frame Organism',
	component: SiteFrameOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		children: <ChildContentAtom />,
	} satisfies PropsForSiteFrameOrganism,
}
