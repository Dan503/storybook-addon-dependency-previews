import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
export function sbDepsVitePlugin() {
    const virtId = 'virtual:dependency-previews-json';
    const resolved = '\0' + virtId;
    return {
        name: 'sb-deps',
        resolveId(id) {
            return id === virtId ? resolved : null;
        },
        load(id) {
            if (id !== resolved)
                return null;
            const jsonPath = resolve(process.cwd(), '.storybook/dependency-previews.json');
            const json = existsSync(jsonPath)
                ? readFileSync(jsonPath, 'utf8')
                : '{}';
            return `export default ${json};`;
        },
    };
}
