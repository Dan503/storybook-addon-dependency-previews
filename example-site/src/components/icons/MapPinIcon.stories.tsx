import type { Meta } from '@storybook/react-vite'
import { MapPinIcon } from './MapPinIcon'
import type { IconProps } from './iconTypes'

const meta: Meta<typeof MapPinIcon> = {
	title: 'Icons / Map Pin Icon',
	component: MapPinIcon,
	tags: ['autodocs', 'atom', 'icon'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {} satisfies IconProps,
}
