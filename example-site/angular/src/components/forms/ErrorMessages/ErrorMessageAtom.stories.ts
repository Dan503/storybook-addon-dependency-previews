import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ErrorMessageAtomComponent } from './ErrorMessageAtom.component'

const meta: Meta<ErrorMessageAtomComponent> = {
	title: 'Forms / Error Messages / Error Message Atom',
	component: ErrorMessageAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ErrorMessageAtomComponent>

export const Primary: Story = {
	args: { message: 'This field is required' },
}
