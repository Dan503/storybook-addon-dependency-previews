import React from "react"
import {
	Controls,
	Description,
	DocsContainer,
	type DocsContainerProps,
	Primary,
	Stories,
	Subtitle,
	Title,
} from '@storybook/addon-docs/blocks'
import type { PropsWithChildren } from 'react'
import { convert, create, ThemeProvider } from 'storybook/theming'
import { DependencyPreviews } from '../blocks'
import type { StorybookParameters } from '../types'

export { DependencyPreviews }

const sbLightTheme = create({ base: 'light' })

const sbTheme = convert(sbLightTheme)

// Storybook's DocsContainer already provides a theme via its own styled-components
// context. However, in Vite production builds, styled-components ends up in two
// separate bundles (iframe and DocsRenderer), each with their own ThemeContext.
// DocsContainer only covers the DocsRenderer context (Il). This wrapper adds a
// ThemeProvider that uses the iframe bundle's styled-components context (Ua),
// so that docs UI components like ActionButton also receive the theme.
function ThemedDocsContainer({
	children,
	...props
}: PropsWithChildren<DocsContainerProps>) {
	return (
		<ThemeProvider theme={sbTheme}>
			<DocsContainer {...props}>{children}</DocsContainer>
		</ThemeProvider>
	)
}

export function DefaultAutoDocsLayout() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<Primary />
			<Controls />
			<DependencyPreviews />
			<Stories />
		</>
	)
}

export const defaultPreviewParameters: StorybookParameters = {
	docs: {
		page: () => <DefaultAutoDocsLayout />,
		theme: sbLightTheme,
		container: ThemedDocsContainer,
	},
}
