import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
// Same import trick as in the Doc Block
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lineageData from 'virtual:lineage-json';
export function GraphView() {
    const graph = lineageData;
    const [q, setQ] = React.useState('');
    if (!graph)
        return _jsx("div", { children: "Lineage data not loaded." });
    const entries = Object.entries(graph)
        .filter(([k]) => k.toLowerCase().includes(q.toLowerCase()))
        .sort(([a], [b]) => a.localeCompare(b));
    return (_jsxs("div", { style: { padding: 12, display: 'grid', gap: 12 }, children: [_jsx("input", { placeholder: "Filter by file path", value: q, onChange: (e) => setQ(e.target.value), style: { padding: 6, font: 'inherit' } }), _jsxs("div", { style: { fontSize: 12, opacity: 0.7 }, children: [entries.length, " of ", Object.keys(graph).length, " components"] }), _jsx("div", { style: { display: 'grid', gap: 10 }, children: entries.map(([file, node]) => (_jsxs("details", { children: [_jsx("summary", { children: _jsx("code", { children: file }) }), _jsxs("div", { style: {
                                display: 'grid',
                                gap: 6,
                                padding: '6px 0 0',
                            }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Uses" }), _jsx("ul", { children: node.uses.map((f) => (_jsx("li", { children: _jsx("code", { children: f }) }, f))) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Used by" }), _jsx("ul", { children: node.usedBy.map((f) => (_jsx("li", { children: _jsx("code", { children: f }) }, f))) })] })] })] }, file))) })] }));
}
