import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './PhoneIcon.lit'
import type { PhoneIcon } from './PhoneIcon.lit'

const meta: Meta<PhoneIcon> = {
	title: '01 Atoms / Icons / Phone Icon',
	component: 'app-phone-icon',
	tags: ['autodocs', 'icon'],
	parameters: {
		layout: 'centered',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-phone-icon altText=${ifDefined(args.altText)}></app-phone-icon>`,
}

export default meta

type Story = StoryObj<PhoneIcon>

export const Primary: Story = {}
