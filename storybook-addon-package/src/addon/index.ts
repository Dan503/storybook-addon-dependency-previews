import { createRequire } from 'module'
import { sbDepsVitePlugin } from './vitePlugin'

const require = createRequire(import.meta.url)

export const managerEntries = [require.resolve('../manager.cjs')]

export async function viteFinal(config: any) {
	config.plugins = [...(config.plugins ?? []), sbDepsVitePlugin()]
	return config
}
