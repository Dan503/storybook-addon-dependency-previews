import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { InternalLinkAtomDirective } from './InternalLinkAtom.directive';

// A directive draws no markup of its own, so unlike the other atoms these stories
// write the anchor it sits on by hand. That anchor is the point: the directive
// puts the finished address on whatever link the surrounding markup already had.
const meta: Meta<InternalLinkAtomDirective> = {
	title: '01 Atoms / Internal Link Atom',
	component: InternalLinkAtomDirective,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<InternalLinkAtomDirective>;

/** A route with nothing changing in it is already the address. */
export const FixedRoute: Story = {
	args: {
		internalLink: '/categories',
	},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [InternalLinkAtomDirective],
		},
		template: `
			<a [internalLink]="internalLink" class="text-teal-700 underline">
				All food categories
			</a>
		`,
	}),
};

/** A route with a changing piece in it, filled in from `hrefParams`. */
export const RouteWithAChangingPiece: Story = {
	args: {
		internalLink: '/categories/:category',
		hrefParams: { category: 'Beef' },
	},
	render: (args) => ({
		props: args,
		moduleMetadata: {
			imports: [InternalLinkAtomDirective],
		},
		template: `
			<a
				[internalLink]="internalLink"
				[hrefParams]="hrefParams"
				class="text-teal-700 underline"
			>
				Beef meals
			</a>
		`,
	}),
};
