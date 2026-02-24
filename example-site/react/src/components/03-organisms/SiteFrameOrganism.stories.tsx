import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ChildContentAtom } from '../zz-meta-components/ChildContentAtom'
import {
	SiteFrameOrganism,
	type PropsForSiteFrameOrganism,
} from './SiteFrameOrganism'

const meta: Meta<typeof SiteFrameOrganism> = {
	title: '03 Organisms / Site Frame Organism',
	component: SiteFrameOrganism,
	tags: ['autodocs', 'organism'],
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
	} satisfies PropsForSiteFrameOrganism,
}
