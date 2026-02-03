import type { Meta } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { HeaderOrganism } from './HeaderOrganism'

const meta: Meta<typeof HeaderOrganism> = {
	title: '03 organisms / Header Organism',
	component: HeaderOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

export const Default = {
	args: {},
}
