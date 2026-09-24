import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ButtonAtom.lit'
import type { ButtonAtom } from './ButtonAtom.lit'

const meta: Meta<ButtonAtom> = {
	title: '01 Atoms / Button Atom',
	component: 'app-button-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-button-atom
			type=${ifDefined(args.type)}
			@click=${() => alert('Button clicked!')}
			>Click me</app-button-atom
		>`,
}

export default meta

type Story = StoryObj<ButtonAtom>

export const Primary: Story = {}
