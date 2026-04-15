import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ExternalLinkAtomComponent } from './ExternalLinkAtom.component';

const meta: Meta<ExternalLinkAtomComponent> = {
	title: '01 Atoms / External Link Atom',
	component: ExternalLinkAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ExternalLinkAtomComponent>;

export const Primary: Story = {
	args: {
		href: 'https://www.example.com',
	},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [ExternalLinkAtomComponent],
		},
		template: `
			<external-link-atom [href]="href">
				Visit Example.com
			</external-link-atom>
		`,
	}),
};
