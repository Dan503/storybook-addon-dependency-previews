import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { useForm } from '@formisch/vue'
import {
	contactFormSchema,
	exampleContactFormValues,
} from 'example-site-shared/data'
import FormDataPreviewAtom from './FormDataPreviewAtom.vue'

const meta: Meta<typeof FormDataPreviewAtom> = {
	title: 'Zz Meta Components / Form Data Preview / Form Data Preview Atom',
	component: FormDataPreviewAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: () => ({
		components: { FormDataPreviewAtom },
		setup() {
			const form = useForm({
				schema: contactFormSchema,
				initialInput: exampleContactFormValues,
			})
			return { form }
		},
		template: `<FormDataPreviewAtom :form="form" />`,
	}),
}
