import { react } from '@storybook-astro/framework/integrations'

export default {
	stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
	framework: {
		name: '@storybook-astro/framework',
		options: {
			integrations: [react({ include: ['**/*.tsx'] })],
		},
	},
}
