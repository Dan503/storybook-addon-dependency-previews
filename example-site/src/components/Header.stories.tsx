import type { Meta } from '@storybook/react-vite'
import { Header } from './Header'

const meta: Meta<typeof Header> = {
	title: 'Header',
	component: Header,
	tags: ['autodocs', 'atom'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {},
}
