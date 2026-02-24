import type { Meta } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { MapPinIcon } from './MapPinIcon'
import type { IconProps } from './iconTypes'

const meta: Meta<typeof MapPinIcon> = {
	title: '01 Atoms / Icons / Map Pin Icon',
	component: MapPinIcon,
	tags: ['autodocs', 'atom', 'icon'],
	parameters: {
		layout: 'centered',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

export const Default = {
	args: {} satisfies IconProps,
}
