import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ScreenPaddingAtomComponent } from './ScreenPaddingAtom.component'

const meta: Meta<ScreenPaddingAtomComponent> = {
	title: '01 Atoms / Screen Padding Atom',
	component: ScreenPaddingAtomComponent,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ScreenPaddingAtomComponent>

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<app-screen-padding-atom><p class="bg-teal-100 p-2">Content with horizontal padding</p></app-screen-padding-atom>`,
	}),
}

export const WithVerticalPadding: Story = {
	render: (args) => ({
		props: { padVertical: true },
		template: `<app-screen-padding-atom [padVertical]="padVertical"><p class="bg-teal-100 p-2">Content with all-sides padding</p></app-screen-padding-atom>`,
	}),
}
