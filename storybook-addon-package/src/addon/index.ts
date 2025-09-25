// This file is a server side file
// ⚠️ Do not import React, @storybook/blocks, or any UI here.
// ⚠️ Do not export anything from this file intended for use in the UI
import { fileURLToPath } from 'node:url'

const manager = fileURLToPath(new URL('../manager.js', import.meta.url))
const preview = fileURLToPath(new URL('../preview.js', import.meta.url))

export const managerEntries = (entries: string[] = []) => [...entries, manager]
export const previewAnnotations = (entries: string[] = []) => [
	...entries,
	preview,
]
