import type { Meta } from '@storybook/react-vite'
import { Button } from './button'

// Button.stories.tsx
const meta: Meta<typeof Button> = {
	title: 'Atoms/Button',
	component: Button,
	tags: ['autodocs'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = { args: { children: 'Label' } }
