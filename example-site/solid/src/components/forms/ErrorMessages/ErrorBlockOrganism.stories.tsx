import type { Meta } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { NonEmptyArray } from 'example-site-shared/utils'
import {
	ErrorBlockOrganism,
	type PropsForErrorBlockOrganism,
} from './ErrorBlockOrganism'

const meta: Meta<typeof ErrorBlockOrganism> = {
	title: 'Forms / Error Messages / Error Block Organism',
	component: ErrorBlockOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

const errors: NonEmptyArray<string> = ['Error One', 'Second error']

export const ErrorStrings = {
	args: {
		errors,
	} satisfies PropsForErrorBlockOrganism,
}

export const ErrorObjects = {
	args: {
		errors: errors.map((err) => new Error(err)),
	} satisfies PropsForErrorBlockOrganism,
}
