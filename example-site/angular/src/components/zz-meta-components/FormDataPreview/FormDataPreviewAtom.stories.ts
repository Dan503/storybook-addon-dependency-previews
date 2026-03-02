import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { defaultContactFormValues } from 'example-site-shared/data'
import { FormDataPreviewAtomComponent } from './FormDataPreviewAtom.component'

const meta: Meta<FormDataPreviewAtomComponent> = {
	title: 'Meta / Form Data Preview / Form Data Preview Atom',
	component: FormDataPreviewAtomComponent,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<FormDataPreviewAtomComponent>

export const Primary: Story = {
	args: { formValues: defaultContactFormValues },
}
