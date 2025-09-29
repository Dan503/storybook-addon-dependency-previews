export type Graph = Record<string, Deps>

export interface Deps {
	builtWith: Array<ComponentInfo>
	usedIn: Array<ComponentInfo>
}

export interface ComponentInfo {
	path: string
	storyId?: string
	storyTitle?: string
}
