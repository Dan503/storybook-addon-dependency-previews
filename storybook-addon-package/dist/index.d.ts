export type DefaultTags = 'atom' | 'molecule' | 'organism' | 'template' | 'page';
export type CustomTag = string & {};
/** Adds `autodocs` tag by default and gives autocomplete atomic design tag options */
export declare function tags<CustomTags extends string>(...tagNames: Array<DefaultTags | CustomTags | CustomTag>): Array<DefaultTags | CustomTags | CustomTag | 'autodocs'>;
export * from './blocks/index';
export * from './panels/index';
