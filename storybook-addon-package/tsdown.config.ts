import { defineConfig } from 'tsdown'

export default defineConfig([
	{
		entry: ['./src/index.ts', './src/manager.tsx', './src/preview.tsx'],
		outDir: 'dist',
		platform: 'neutral',
		dts: true,
		watch: ['src/**/*.{ts,tsx,css}'],
	},
	// --- CLI 1
	{
		entry: './cli/sb-deps.ts',
		outDir: 'dist/cli',
		platform: 'node',
		tsconfig: './cli/tsconfig.json',
		dts: true,
		format: 'cjs',
		fixedExtension: true,
		watch: ['cli/**/*.{ts,tsx}'],
	},
	// --- CLI 2
	{
		entry: './cli/scripts/postprocess.ts',
		outDir: 'dist/cli/scripts',
		platform: 'node',
		tsconfig: './cli/tsconfig.json',
		dts: true,
		format: 'esm',
		fixedExtension: true,
		watch: ['cli/**/*.{ts,tsx}'],
	},
])
