import { jsx as _jsx } from "react/jsx-runtime";
import { addons, types } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';
import { ADDON_ID, PANEL_ID } from './constants';
import { GraphView } from './panel/GraphView';
addons.register(ADDON_ID, () => {
    addons.add(PANEL_ID, {
        title: 'Dependency Previews',
        type: types.PANEL,
        match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
        render: ({ active }) => (_jsx(AddonPanel, { active: active, children: _jsx(GraphView, {}) })),
    });
});
