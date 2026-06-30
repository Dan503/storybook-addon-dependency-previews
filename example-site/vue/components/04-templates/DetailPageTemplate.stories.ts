import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMeal } from 'example-site-shared/data'
import DetailPageTemplate, {
	type PropsForDetailPageTemplate,
} from './DetailPageTemplate.vue'

const meta: Meta<typeof DetailPageTemplate> = {
	title: '04 Templates / Detail Page Template',
	component: DetailPageTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		meal: {
			mapping: {
				example: exampleMeal,
				none: undefined,
			},
			control: {
				type: 'select',
			},
			options: ['example', 'none'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		meal: 'example' as unknown as PropsForDetailPageTemplate['meal'],
	},
	render: (args) => ({
		components: { DetailPageTemplate },
		setup() {
			return { args }
		},
		template: `<DetailPageTemplate v-bind="args" />`,
	}),
}

export const Loading: Story = {
	args: {
		meal: null,
		isLoading: true,
	},
	render: (args) => ({
		components: { DetailPageTemplate },
		setup() {
			return { args }
		},
		template: `<DetailPageTemplate v-bind="args" />`,
	}),
}

export const NullMeal: Story = {
	args: {
		meal: null,
		isLoading: false,
	},
	render: (args) => ({
		components: { DetailPageTemplate },
		setup() {
			return { args }
		},
		template: `<DetailPageTemplate v-bind="args" />`,
	}),
}
