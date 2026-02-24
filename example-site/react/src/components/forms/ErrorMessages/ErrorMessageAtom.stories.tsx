import type { Meta } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	ErrorMessageAtom,
	type PropsForErrorMessageAtom,
} from './ErrorMessageAtom'

// Button.stories.tsx
const meta: Meta<typeof ErrorMessageAtom> = {
	title: 'Forms/Error Messages/Error Message Atom',
	component: ErrorMessageAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

export const ErrorStrings = {
	args: {
		error: 'This is error text',
	} satisfies PropsForErrorMessageAtom,
}

export const ErrorObjects = {
	args: {
		error: new Error('This is error text'),
	} satisfies PropsForErrorMessageAtom,
}
