import { sbDepsVitePlugin } from './vitePlugin';
export async function viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), sbDepsVitePlugin()];
    return config;
}
