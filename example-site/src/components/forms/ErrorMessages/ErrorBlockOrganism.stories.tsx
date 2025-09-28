import type { Meta } from '@storybook/react-vite'
import {
  ErrorBlockOrganism,
  type PropsForErrorBlockOrganism,
} from './ErrorBlockOrganism'

// Button.stories.tsx
const meta: Meta<typeof ErrorBlockOrganism> = {
  title: 'Forms/ErrorMessages/ErrorBlockOrganism',
  component: ErrorBlockOrganism,
  tags: ['autodocs', 'organism'],
  parameters: {
    __filePath: import.meta.url,
  },
}

export default meta

const errors = ['Error One', 'Second error']

export const ErrorStrings = {
  args: {
    errors,
  } satisfies PropsForErrorBlockOrganism,
}

export const ErrorObjects = {
  args: {
    errors: errors.map((err) => new Error(err)),
  } satisfies PropsForErrorBlockOrganism,
}
