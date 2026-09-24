import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ExternalLinkAtom.lit'
import type { ExternalLinkAtom } from './ExternalLinkAtom.lit'

const meta: Meta<ExternalLinkAtom> = {
	title: '01 Atoms / External Link Atom',
	component: 'app-external-link-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-external-link-atom .href=${args.href}
			>Storybook Dependency Previews on GitHub</app-external-link-atom
		>`,
}

export default meta

type Story = StoryObj<ExternalLinkAtom>

export const Primary: Story = {
	args: {
		href: 'https://github.com/Dan503/storybook-addon-dependency-previews',
	},
}
