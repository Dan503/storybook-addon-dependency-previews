import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	HeroBlockOrganism,
	type PropsForHeroBlockOrganism,
} from './HeroBlockOrganism'

const meta: Meta<typeof HeroBlockOrganism> = {
	title: 'Organisms / Hero Block Organism',
	component: HeroBlockOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'fullscreen',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	parameters: {},
	args: {
		title: 'Welcome to the Storybook Dependency Previews example site',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		children: (
			<p>
				This is an example site to demonstrate the dependency preview addon in a
				realistic environment
			</p>
		),
	} satisfies PropsForHeroBlockOrganism,
}
