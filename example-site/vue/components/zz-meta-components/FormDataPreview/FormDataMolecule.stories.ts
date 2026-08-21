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
	// Storybook's Meta only accepts a plain component, and this one is written
	// with `generic="..."`, which Meta has no way to describe — so it is
	// rejected here despite working fine at runtime. TypeScript flags the
	// marker itself once Storybook can type it, so it cannot be left behind.
	// @ts-expect-error Meta cannot accept a component declared `generic="..."`
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
