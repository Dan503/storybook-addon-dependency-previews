import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { exampleContactFormValues } from 'example-site-shared/data'
import '../ChildContentAtom.lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './FormDataMolecule.lit'
import type { FormDataMolecule } from './FormDataMolecule.lit'

const meta: Meta<FormDataMolecule> = {
	title: 'ZZ Meta Components / Form Data Preview / Form Data Molecule',
	component: 'app-form-data-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	render: (args) =>
		html`<app-form-data-molecule .values=${args.values}>
			<app-child-content-atom></app-child-content-atom>
		</app-form-data-molecule>`,
}

export default meta

type Story = StoryObj<FormDataMolecule>

export const Primary: Story = {
	args: { values: exampleContactFormValues },
}
