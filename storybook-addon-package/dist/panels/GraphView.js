import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const DEFAULT_URL = '/dependency-previews.json';
export function GraphView() {
    const [graph, setGraph] = useState(null);
    const [q, setQ] = useState('');
    const [err, setErr] = useState(null);
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch(DEFAULT_URL);
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const json = (await res.json());
                if (alive)
                    setGraph(json);
            }
            catch (e) {
                if (alive)
                    setErr(e?.message || String(e));
            }
        })();
        return () => {
            alive = false;
        };
    }, []);
    if (err)
        return _jsxs("p", { children: ["Failed to load dependency previews: ", err] });
    if (!graph)
        return _jsx("p", { children: "Loading dependency graph\u2026" });
    const entries = Object.entries(graph)
        .filter(([k]) => k.toLowerCase().includes(q.toLowerCase()))
        .sort(([a], [b]) => a.localeCompare(b));
    return (_jsxs("div", { style: { padding: 12, display: 'grid', gap: 12 }, children: [_jsx("input", { placeholder: "Filter by file path", value: q, onChange: (e) => setQ(e.target.value), style: { padding: 6, font: 'inherit' } }), _jsxs("div", { style: { fontSize: 12, opacity: 0.7 }, children: [entries.length, " of ", Object.keys(graph).length, " components"] }), _jsx("div", { style: { display: 'grid', gap: 10 }, children: entries.map(([file, node]) => (_jsxs("details", { children: [_jsx("summary", { children: _jsx("code", { children: file }) }), _jsxs("div", { style: {
                                display: 'grid',
                                gap: 6,
                                padding: '6px 0 0',
                            }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Built with" }), _jsx("ul", { children: node.builtWith.map((f) => (_jsx("li", { children: _jsx("code", { children: f.path }) }, f.path))) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Used in" }), _jsx("ul", { children: node.usedIn.map((f) => (_jsx("li", { children: _jsx("code", { children: f.path }) }, f.path))) })] })] })] }, file))) })] }));
}
