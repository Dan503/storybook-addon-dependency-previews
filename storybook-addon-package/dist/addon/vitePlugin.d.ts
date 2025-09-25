export declare function sbDepsVitePlugin(): {
    name: string;
    resolveId(id: string): string | null;
    load(id: string): string | null;
};
