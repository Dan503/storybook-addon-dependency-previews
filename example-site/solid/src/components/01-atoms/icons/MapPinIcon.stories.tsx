import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { MapPinIcon, type PropsForMapPinIcon } from './MapPinIcon'

const meta: Meta<typeof MapPinIcon> = {
  title: '01 Atoms / Icons / Map Pin Icon',
  component: MapPinIcon,
  tags: ["autodocs","icon"],
  parameters: {
    layout: 'padded',
  } satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {} satisfies PropsForMapPinIcon,
}
