import type { ComponentProps } from 'astro/types'
import type { AstroRenderer } from '@storybook-astro/framework'
import type {
	ComponentAnnotations,
	StoryAnnotations,
} from 'storybook/internal/types'

type AstroComponent = (props: any) => any

/** A component's own props, plus the `slots` arg that @storybook-astro reads slot content from. */
export type ArgsFor<TComponent extends AstroComponent> =
	ComponentProps<TComponent> & {
		slots?: Record<string, unknown>
	}

export type Meta<TComponent extends AstroComponent> = ComponentAnnotations<
	AstroRenderer,
	ArgsFor<TComponent>
>
export type StoryObj<TComponent extends AstroComponent> = StoryAnnotations<
	AstroRenderer,
	ArgsFor<TComponent>
>
