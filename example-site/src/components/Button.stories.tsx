import type { Meta } from '@storybook/react-vite'
import { Button } from './button'
import { DefinedTags } from 'storybook-addon-dependency-previews'

const tags: DefinedTags = ['autodocs', 'atom']

// Button.stories.tsx
const meta: Meta<typeof Button> = {
	title: 'Atoms/Button',
	component: Button,
	tags,
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = { args: { children: 'Label' } }
