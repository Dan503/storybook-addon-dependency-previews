import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ExternalLinkAtomComponent } from './ExternalLinkAtom.component'

const meta: Meta<ExternalLinkAtomComponent> = {
	title: '01 Atoms / External Link Atom',
	component: ExternalLinkAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ExternalLinkAtomComponent>

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<app-external-link-atom href="https://github.com/Dan503/storybook-addon-dependency-previews">View on GitHub</app-external-link-atom>`,
	}),
}
