import type { Meta } from '@storybook/react-vite'
import {
  ErrorListMolecule,
  type PropsForErrorListMolecule,
} from './ErrorListMolecule'

// Button.stories.tsx
const meta: Meta<typeof ErrorListMolecule> = {
  title: 'Forms/ErrorMessages/ErrorListMolecule',
  component: ErrorListMolecule,
  tags: ['autodocs', 'molecule'],
  parameters: {
    __filePath: import.meta.url,
  },
}

export default meta

const errors = ['Error One', 'Second error']

export const ErrorStrings = {
  args: {
    errors,
  } satisfies PropsForErrorListMolecule,
}

export const ErrorObjects = {
  args: {
    errors: errors.map((err) => new Error(err)),
  } satisfies PropsForErrorListMolecule,
}
