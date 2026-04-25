import { defineConfig, type UserConfig } from 'tsdown'

const commonConfig: UserConfig = {
	outDir: 'dist',
	dts: true,
	format: ['cjs', 'esm'],
	fixedExtension: true,
	sourcemap: true,
	treeshake: false,
	// Don’t inline SB deps or CSS files:
	external: [/^@storybook\//, /^storybook\//, /\.css$/],
	unbundle: true,
}

export default defineConfig([
	{
		...commonConfig,
		entry: {
			index: './src/index.ts',
			manager: './src/manager.tsx',
			config: './src/config.ts',
		},
		platform: 'browser',
	},
	{
		...commonConfig,
		entry: {
			'addon/index': './src/addon/index.ts',
			'addon/preset': './src/addon/preset.ts',
			'addon/vitePlugin': './src/addon/vitePlugin.ts',
			'cli/sb-deps': './cli/sb-deps.ts',
			'cli/scripts/depcruise.config': './cli/scripts/depcruise.config.ts',
			'cli/scripts/postprocess': './cli/scripts/postprocess.ts',
			'cli/setup/index': './cli/setup/index.ts',
			'cli/setup/detect': './cli/setup/detect.ts',
			'cli/setup/install': './cli/setup/install.ts',
			'cli/setup/prompt': './cli/setup/prompt.ts',
			'cli/setup/patchers/main': './cli/setup/patchers/main.ts',
			'cli/setup/patchers/preview': './cli/setup/patchers/preview.ts',
			'cli/setup/patchers/packageJson':
				'./cli/setup/patchers/packageJson.ts',
		},
		platform: 'node',
	},
])
