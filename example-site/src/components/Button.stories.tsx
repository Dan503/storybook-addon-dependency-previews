import type { Meta } from '@storybook/react-vite'
import { Button } from './button'
import { tags } from 'storybook-addon-dependency-previews'

// Button.stories.tsx
const meta: Meta<typeof Button> = {
	title: 'Atoms/Button',
	component: Button,
	tags: tags('atom'),
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = { args: { children: 'Label' } }
