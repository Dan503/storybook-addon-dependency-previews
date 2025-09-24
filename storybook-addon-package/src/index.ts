// ESM-safe path resolution
import { fileURLToPath } from 'node:url'

const manager = fileURLToPath(new URL('./manager.js', import.meta.url))
const preview = fileURLToPath(new URL('./preview.js', import.meta.url))

// Storybook preset API – do NOT import any UI here
export const managerEntries = (entries: string[] = []) => [...entries, manager]
export const previewAnnotations = (entries: string[] = []) => [
	...entries,
	preview,
]
