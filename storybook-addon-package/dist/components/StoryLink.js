import { jsx as _jsx } from "react/jsx-runtime";
import { linkTo } from '@storybook/addon-links';
export function StoryLink({ info }) {
    if (!info.storyId) {
        return info.path;
    }
    const linkPath = `/?path=/docs/${info.storyId}`;
    return (_jsx("a", { href: linkPath, onClick: (e) => {
            e.preventDefault();
            linkTo(info.storyId)(e);
        }, children: info.storyTitle }));
}
