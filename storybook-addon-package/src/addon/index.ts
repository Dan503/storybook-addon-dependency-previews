import { createRequire } from 'module'
import { sbDepsVitePlugin } from './vitePlugin'

const require = createRequire(import.meta.url)

export const managerEntries = [require.resolve('../manager.mjs')]

/**
 * Storybook addons that this addon depends on. Registering these here means
 * users only need to add `'storybook-addon-dependency-previews/addon'` to
 * their `main.ts` `addons` array — the docs/links addons are auto-registered.
 *
 * This must live on the same preset module that Storybook actually loads.
 * When users register us via the `/addon` subpath, Storybook loads this file
 * directly and ignores `package.json`'s `storybook-addon.preset` field, so
 * exporting `addons` only from `preset.ts` is not sufficient.
 */
export const addons = ['@storybook/addon-docs', '@storybook/addon-links']

export async function viteFinal(config: any) {
	config.plugins = [...(config.plugins ?? []), sbDepsVitePlugin()]
	return config
}
