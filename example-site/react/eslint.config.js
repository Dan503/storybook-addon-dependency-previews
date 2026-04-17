// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

const tanstackConfigWithRoot = tanstackConfig.map((config) => {
	if (config.languageOptions?.parserOptions?.project === true) {
		return {
			...config,
			languageOptions: {
				...config.languageOptions,
				parserOptions: {
					...config.languageOptions.parserOptions,
					tsconfigRootDir: import.meta.dirname,
				},
			},
		}
	}
	return config
})

export default [
	...tanstackConfigWithRoot,
	...storybook.configs['flat/recommended'],
	{
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{ selector: 'typeParameter', format: ['StrictPascalCase'] },
			],
		},
	},
]
