import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChildContentAtom, type PropsForChildContentAtom } from './ChildContentAtom'

const meta: Meta<typeof ChildContentAtom> = {
  title: 'Meta Components / Child Content Atom',
  component: ChildContentAtom,
  tags: ["autodocs","atom"],
  parameters: {
    __filePath: import.meta.url,
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {} satisfies PropsForChildContentAtom,
}
