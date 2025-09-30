export type Graph = Record<string, Deps>

export interface Deps {
	builtWith: Array<StoryInfo>
	usedIn: Array<StoryInfo>
}

export interface StoryInfo {
	componentPath: string
	storyId?: string
	storyTitle?: string
	storyPath?: string
}
