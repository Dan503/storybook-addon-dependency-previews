import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ExternalLinkIconComponent } from './ExternalLinkIcon.component'

const meta: Meta<ExternalLinkIconComponent> = {
	title: '01 Atoms / Icons / External Link Icon',
	component: ExternalLinkIconComponent,
	tags: ["autodocs","icon"],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
