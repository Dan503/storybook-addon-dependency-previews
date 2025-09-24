import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useOf } from '@storybook/blocks';
// Consumers will alias this import (see examples/.storybook/main.ts)
// so we keep the path constant from the addon POV.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lineageData from 'virtual:lineage-json';
export function DependencyPreviews() {
    const { story } = useOf('story');
    const filePath = story?.parameters?.__filePath;
    const graph = lineageData;
    if (!filePath || !graph) {
        return _jsx("div", { children: "No lineage data available." });
    }
    const node = graph[filePath];
    if (!node) {
        return _jsx("div", { children: "No lineage found for this component." });
    }
    return (_jsxs("div", { style: { display: 'grid', gap: 12 }, children: [_jsxs("section", { children: [_jsx("h3", { children: "Built with" }), node.uses.length ? (_jsx("ul", { children: node.uses.map((f) => (_jsx("li", { children: shortName(f) }, f))) })) : (_jsx("p", { children: "\u2014" }))] }), _jsxs("section", { children: [_jsx("h3", { children: "Used in" }), node.usedBy.length ? (_jsx("ul", { children: node.usedBy.map((f) => (_jsx("li", { children: shortName(f) }, f))) })) : (_jsx("p", { children: "\u2014" }))] })] }));
}
function shortName(file) {
    // e.g., components/Button/Button.tsx → Button/Button.tsx
    return file.split('/').slice(-2).join('/');
}
