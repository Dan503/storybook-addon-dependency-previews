import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Controls, Description, Primary, Stories, Subtitle, Title, } from '@storybook/blocks';
import { DependencyPreviews } from '../blocks';
export function DefaultAutoDocsLayout() {
    return (_jsxs(_Fragment, { children: [_jsx(Title, {}), _jsx(Subtitle, {}), _jsx(Description, {}), _jsx(Primary, {}), _jsx(Controls, {}), _jsx(DependencyPreviews, {}), _jsx(Stories, {})] }));
}
export const defaultPreviewConfig = {
    parameters: {
        docs: {
            page: () => (_jsxs(_Fragment, { children: [_jsx(Title, {}), _jsx(Subtitle, {}), _jsx(Description, {}), _jsx(Primary, {}), _jsx(Controls, {}), _jsx(DependencyPreviews, {}), _jsx(Stories, {})] })),
        },
    },
};
