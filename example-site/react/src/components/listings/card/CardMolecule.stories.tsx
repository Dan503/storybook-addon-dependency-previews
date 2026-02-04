import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMeal } from 'example-site-shared/data'
import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'

const meta: Meta<typeof CardMolecule> = {
	title: 'Listings / Card / Card Molecule',
	component: CardMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		title: 'Title of the card',
		href: '/',
		description: `Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image,
	} satisfies PropsForCardMolecule,
	decorators: [
		(Story) => (
			<div style={{ width: '400px' }}>
				<Story />
			</div>
		),
	],
	parameters: {
		layout: 'centered',
	},
}

export const FullWidth: Story = {
	args: {
		title: 'Full Width Card',
		href: '/',
		description: `This card takes the full width of its container. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
		imgSrc: exampleMeal.image,
	} satisfies PropsForCardMolecule,
	parameters: {
		layout: 'padded',
	},
}
