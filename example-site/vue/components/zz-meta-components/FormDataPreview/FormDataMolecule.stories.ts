import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { useForm } from '@formisch/vue'
import {
	contactFormSchema,
	exampleContactFormValues,
} from 'example-site-shared/data'
import ChildContentAtom from '../ChildContentAtom.vue'
import FormDataMolecule from './FormDataMolecule.vue'

const meta: Meta<typeof FormDataMolecule> = {
	title: 'Zz Meta Components / Form Data Preview / Form Data Molecule',
	component: FormDataMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: () => ({
		components: { FormDataMolecule, ChildContentAtom },
		setup() {
			const form = useForm({
				schema: contactFormSchema,
				initialInput: exampleContactFormValues,
			})
			return { form }
		},
		template: `
			<FormDataMolecule :form="form">
				<ChildContentAtom />
			</FormDataMolecule>
		`,
	}),
}
