// Button.stories.tsx
import { Button } from './Button'
export default {
	title: 'Atoms/Button',
	component: Button,
	parameters: {
		__filePath: import.meta.url,
	},
}

export const Default = { args: { children: 'Label' } }
