import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ContactTemplate.lit'
import type { ContactTemplate } from './ContactTemplate.lit'

const meta: Meta<ContactTemplate> = {
	title: '04 Templates / Contact Template',
	component: 'app-contact-template',
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: () => html`<app-contact-template></app-contact-template>`,
}

export default meta

type Story = StoryObj<ContactTemplate>

export const Primary: Story = {}
