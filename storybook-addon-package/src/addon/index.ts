import { sbDepsVitePlugin } from './vitePlugin'

export async function viteFinal(config: any) {
	config.plugins = [...(config.plugins ?? []), sbDepsVitePlugin()]
	return config
}
