import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { BgImageContainerAtomComponent } from './BgImageContainerAtom.component';

const meta: Meta<BgImageContainerAtomComponent> = {
	title: '01 Atoms / Bg Image Container Atom',
	component: BgImageContainerAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<BgImageContainerAtomComponent>;

export const Primary: Story = {
	args: {
		imgSrc: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
		altText: 'Placeholder Image',
		class: 'h-64 w-full grid place-items-center',
	},
	render: (args) => ({
		props: args,
		template: `
			<bg-image-container-atom
				[class]="class"
				[imgSrc]="imgSrc"
				[altText]="altText"
			>
				<p>Child content</p>
			</bg-image-container-atom>
		`,
	}),
};
