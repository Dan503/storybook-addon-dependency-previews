import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { exampleContactFormValues } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './FormDataPreviewAtom.lit'
import type { FormDataPreviewAtom } from './FormDataPreviewAtom.lit'

const meta: Meta<FormDataPreviewAtom> = {
	title: 'ZZ Meta Components / Form Data Preview / Form Data Preview Atom',
	component: 'app-form-data-preview-atom',
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-form-data-preview-atom
			.values=${args.values}
		></app-form-data-preview-atom>`,
}

export default meta

type Story = StoryObj<FormDataPreviewAtom>

export const Primary: Story = {
	args: { values: exampleContactFormValues },
}
