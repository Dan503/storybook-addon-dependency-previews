export type DefaultTags =
	| 'atom'
	| 'molecule'
	| 'organism'
	| 'template'
	| 'page'
	| 'autodocs'

/**
 * Provides autocomplete tag suggestions
 *
 * Usage:
 * ```ts
 * // global file
 * import { DefinedTags } from 'storybook-addon-dependency-previews'
 *
 * type CustomTags = 'custom1' | 'custom2'
 * export type ProjectTags = DefinedTags<CustomTags>
 *
 * // story file
 * const tags: ProjectTags = [ 'autodocs', 'atom', 'custom1']`;
 *
 * const meta: Meta<typeof Button> = {
 *   title: 'Atoms/Button',
 *   component: Button,
 *   tags,
 *   parameters: {
 *     __filePath: import.meta.url,
 *   },
 * }
 * export default Meta<typeof Button>
 */
export type DefinedTags<CustomTags extends string = DefaultTags> = Array<
	DefaultTags | CustomTags
>

// Re-export browser blocks so users can import directly
export * from './blocks/index'
export * from './panels/index'
