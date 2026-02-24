import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import {
	HeroBlockOrganism,
	type PropsForHeroBlockOrganism,
} from './HeroBlockOrganism'

const meta: Meta<typeof HeroBlockOrganism> = {
	title: '03 Organisms / Hero Block Organism',
	component: HeroBlockOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	parameters: {},
	args: {
		title: 'Hero Block Title',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		children: <p>This is where the hero block content goes.</p>,
	} satisfies PropsForHeroBlockOrganism,
}
