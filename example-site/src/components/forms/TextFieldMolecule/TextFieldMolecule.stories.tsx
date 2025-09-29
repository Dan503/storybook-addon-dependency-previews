import type { Meta } from '@storybook/react-vite'
import { useForm } from '@tanstack/react-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import {
  TextFieldMolecule,
  type PropsForTextFieldMolecule,
} from './TextFieldMolecule'

// Button.stories.tsx
const meta: Meta<typeof TextFieldMolecule> = {
  title: 'Forms/TextFieldMolecule',
  component: TextFieldMolecule,
  tags: ['autodocs', 'molecule'],
  parameters: {
    __filePath: import.meta.url,
  },
}

export default meta

export const Default = {
  args: {
    label: 'First name',
    placeholder: 'Placeholder text',
  } satisfies PropsForTextFieldMolecule,
  render: (args: PropsForTextFieldMolecule) => {
    const form = useForm({
      defaultValues: {
        firstName: '',
      },
    })

    return (
      <FormDataMolecule form={form}>
        <form.Field name="firstName">
          {(field) => <TextFieldMolecule {...args} field={field} />}
        </form.Field>
      </FormDataMolecule>
    )
  },
}
