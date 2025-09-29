import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useOf } from '@storybook/blocks';
import { useEffect, useState } from 'react';
// If you want to fetch instead, change this path to '/lineage.json' and
// ensure you copy the file to your Storybook's staticDir.
// Here we expect the consuming app to import the JSON (via Vite handling JSON).
function getJsonUrl(storyParams) {
    // Allow consumer override via parameters.dependencyPreviews?.url
    return (storyParams?.dependencyPreviews?.url || '/dependency-previews.json' // default
    );
}
export function DependencyPreviews() {
    const { story } = useOf('story');
    const filePath = story?.parameters?.__filePath;
    const refinedFilePath = filePath?.replace(/^.+\/src\//, 'src/');
    const url = getJsonUrl(story?.parameters);
    const [graph, setGraph] = useState(null);
    const [err, setErr] = useState(null);
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch(url);
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
    }, [url]);
    const node = graph?.[refinedFilePath];
    if (err)
        return _jsxs("div", { children: ["Failed to load dependency previews: ", err] });
    if (!graph)
        return _jsx("div", { children: "Loading dependency previews\u2026" });
    if (!refinedFilePath || !node)
        return _jsx("div", { children: "No dependency previews for this component." });
    return (_jsxs("div", { className: "grid gap-2", children: [_jsxs("details", { children: [_jsx("summary", { children: _jsxs("h2", { children: ["Built with ", node.builtWith.length, " component", plural(node.builtWith)] }) }), _jsx("div", { children: node.builtWith.length ? (_jsx("ul", { children: node.builtWith.map((f) => (_jsx("li", { children: shortName(f) }, f))) })) : (_jsx("p", { children: "\u2014" })) })] }), _jsxs("details", { children: [_jsx("summary", { children: _jsxs("h2", { children: ["Used in ", node.usedIn.length, " component", plural(node.usedIn)] }) }), _jsx("div", { children: node.usedIn.length ? (_jsx("ul", { children: node.usedIn.map((f) => (_jsx("li", { children: shortName(f) }, f))) })) : (_jsx("p", { children: "\u2014" })) })] })] }));
}
function shortName(file) {
    // e.g., components/Button/Button.tsx → Button/Button.tsx
    return file.split('/').slice(-2).join('/');
}
function plural(arr) {
    return arr.length === 1 ? '' : 's';
}
