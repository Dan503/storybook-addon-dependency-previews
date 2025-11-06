import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from '../../../../storybook-addon-package/dist/types.d.mts'
import {
	BgImageContainer,
	type PropsForBgImageContainer,
} from './BgImageContainer'

const meta: Meta<typeof BgImageContainer> = {
	title: '01 Atoms / Bg Image Container',
	component: BgImageContainer,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: 'Placeholder Image',
		children: (
			<p className="text-black text-2xl font-bold border-2 border-dashed border-red-500 p-4">
				Content inside BgImageContainer
			</p>
		),
	} satisfies PropsForBgImageContainer,
}
