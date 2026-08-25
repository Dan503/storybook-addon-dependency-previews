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
	// This component is written with `generic="..."`, and Storybook's `Meta` has no
	// way to describe one of those, so it is rejected here despite working at
	// runtime. TypeScript reports this marker if the rejection ever stops, so it
	// cannot be left behind once Storybook can type these.
	// @ts-expect-error `Meta` cannot accept a component written with `generic="..."`
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
