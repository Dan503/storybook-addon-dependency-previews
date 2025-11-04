import type { Meta } from '@storybook/react-vite'
import { HeaderOrganism } from './HeaderOrganism'

const meta: Meta<typeof HeaderOrganism> = {
	title: '03 organisms / Header Organism',
	component: HeaderOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {},
}
