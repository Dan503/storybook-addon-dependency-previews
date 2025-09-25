export type DefaultTags = 'atom' | 'molecule' | 'organism' | 'template' | 'page'
export type CustomTag = string & {}

/** Adds `autodocs` tag by default and gives autocomplete atomic design tag options */
export function tags<CustomTags extends string>(
	...tagNames: Array<DefaultTags | CustomTags | CustomTag>
): Array<DefaultTags | CustomTags | CustomTag | 'autodocs'> {
	return ['autodocs', ...tagNames]
}

// Re-export browser blocks so users can import directly
export * from './blocks/index'
export * from './panels/index'
