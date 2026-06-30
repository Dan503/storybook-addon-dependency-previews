import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ContactFormOrganism from './ContactFormOrganism.vue'
import ContactFormOrganismDecorator from './ContactFormOrganism.decorator.vue'

const meta: Meta<typeof ContactFormOrganism> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: () => ({
		components: { ContactFormOrganismDecorator },
		template: `<ContactFormOrganismDecorator />`,
	}),
}

export const ErrorState: Story = {
	render: () => ({
		components: { ContactFormOrganismDecorator },
		template: `<ContactFormOrganismDecorator validate="initial" />`,
	}),
}
