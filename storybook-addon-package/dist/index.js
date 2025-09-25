/** Adds `autodocs` tag by default and gives autocomplete atomic design tag options */
export function tags(...tagNames) {
    return ['autodocs', ...tagNames];
}
// Re-export browser blocks so users can import directly
export * from './blocks/index';
export * from './panels/index';
