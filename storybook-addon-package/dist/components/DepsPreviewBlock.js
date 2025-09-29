import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { StoryLink } from './StoryLink';
export function DepsPreviewBlock({ deps, title }) {
    return (_jsxs("details", { children: [_jsx("summary", { children: _jsxs("h2", { children: [title, " ", deps.length, " component", plural(deps)] }) }), _jsx("div", { children: deps.length ? (_jsx("ul", { children: deps.map((f) => (_jsx("li", { children: _jsx(StoryLink, { info: f }) }, f.path))) })) : (_jsx("p", { children: "\u2014" })) })] }));
}
function plural(arr) {
    return arr.length === 1 ? '' : 's';
}
