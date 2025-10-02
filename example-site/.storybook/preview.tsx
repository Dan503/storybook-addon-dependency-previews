import { ProjectAnnotations, Renderer } from '@storybook/types'
import { defaultPreviewParameters } from 'storybook-addon-dependency-previews'

import '../src/styles.css'

const previewConfig: ProjectAnnotations<Renderer> = {
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			sourceBaseUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site',
		},
	},
}

export default previewConfig
