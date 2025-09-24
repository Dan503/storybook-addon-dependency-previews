import React from 'react'
import { addons, types } from 'storybook/manager-api'
import { AddonPanel } from 'storybook/internal/components'
import { ADDON_ID, PANEL_ID } from './constants'
import { GraphView } from './panel/GraphView'

addons.register(ADDON_ID, () => {
	addons.add(PANEL_ID, {
		title: 'Lineage',
		type: types.PANEL,
		match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
		render: ({ active, key }) => (
			<AddonPanel active={active} key={key}>
				<GraphView />
			</AddonPanel>
		),
	})
})
