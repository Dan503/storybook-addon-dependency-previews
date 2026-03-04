import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { BgImageContainerAtomComponent } from './BgImageContainerAtom.component'

const meta: Meta<BgImageContainerAtomComponent> = {
	title: '01 Atoms / Bg Image Container Atom',
	component: BgImageContainerAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<BgImageContainerAtomComponent>

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
		altText: 'A tasty meal',
		tintPercent: 50,
	},
	render: (args) => ({
		props: args,
		template: `<app-bg-image-container-atom imgSrc="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg" altText="A tasty meal" className="border-red-600 border-2 border-dashed" [tintPercent]="50">
			<p>Content on top</p>
		</app-bg-image-container-atom>`,
	}),
}
