import type { Meta } from '@storybook/react-vite'
import { LocationNameMolecule } from './LocationNameMolecule'

const meta: Meta<typeof LocationNameMolecule> = {
	title: 'Housing Property / Location Name Molecule',
	component: LocationNameMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {
		children: 'Canberra, Australia',
	},
}
