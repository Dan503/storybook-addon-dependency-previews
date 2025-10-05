import type { Meta } from '@storybook/react-vite'
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
		__filePath: import.meta.url,
	},
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
