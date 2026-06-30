import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import HeroBlockOrganism, { type PropsForHeroBlockOrganism } from './HeroBlockOrganism.vue'

const meta: Meta<typeof HeroBlockOrganism> = {
	title: '03 Organisms / Hero Block Organism',
	component: HeroBlockOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		title: 'Hero Block Title',
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
	} satisfies PropsForHeroBlockOrganism,
	render: (args) => ({
		components: { HeroBlockOrganism },
		setup() {
			return { args }
		},
		template: `
<HeroBlockOrganism v-bind="args">
	<p>This is where the hero block content goes.</p>
</HeroBlockOrganism>`,
	}),
}
