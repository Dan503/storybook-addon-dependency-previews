import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ChildContentAtom from '../zz-meta-components/ChildContentAtom.vue'
import SiteFrameOrganism, {
	type PropsForSiteFrameOrganism,
} from './SiteFrameOrganism.vue'

const meta: Meta<typeof SiteFrameOrganism> = {
	title: '03 Organisms / Site Frame Organism',
	component: SiteFrameOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForSiteFrameOrganism,
	render: (args) => ({
		components: { SiteFrameOrganism, ChildContentAtom },
		setup() {
			return { args }
		},
		template: `
<SiteFrameOrganism v-bind="args">
	<ChildContentAtom />
</SiteFrameOrganism>`,
	}),
}
