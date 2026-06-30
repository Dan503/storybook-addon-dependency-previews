import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import BgImageContainerAtom, {
	type PropsForBgImageContainerAtom,
} from './BgImageContainerAtom.vue'

const meta: Meta<typeof BgImageContainerAtom> = {
	title: '01 Atoms / Bg Image Container Atom',
	component: BgImageContainerAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: 'Placeholder Image',
	} satisfies PropsForBgImageContainerAtom,
	render: (args) => ({
		components: { BgImageContainerAtom },
		setup() {
			return { args }
		},
		template: `
<BgImageContainerAtom v-bind="args">
	<p class="border-2 border-dashed border-red-500 p-4 text-2xl font-bold text-black">
		Content inside BgImageContainer
	</p>
</BgImageContainerAtom>`,
	}),
}
