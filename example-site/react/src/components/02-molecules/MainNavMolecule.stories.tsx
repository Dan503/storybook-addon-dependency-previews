import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { MainNavMolecule, type PropsForMainNavMolecule } from './MainNavMolecule'

const meta: Meta<typeof MainNavMolecule> = {
  title: '02 Molecules / Main Nav Molecule',
  component: MainNavMolecule,
  tags: ["autodocs","molecule"],
  parameters: {
    layout: 'padded',
    __filePath: import.meta.url,
  } satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {} satisfies PropsForMainNavMolecule,
}
