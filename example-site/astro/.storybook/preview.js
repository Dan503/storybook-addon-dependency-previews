import '../src/1-app/styles-entry.scss'

const preview = {
	// Gives every story a docs page. A story can opt out with '!autodocs'.
	tags: ['autodocs'],
	argTypes: {
		// Stories pass slot content through a `slots` arg. It is not a prop, and the
		// docs page already lists each slot under SLOTS, so leave it out of the table.
		slots: { table: { disable: true } },
	},
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}
export default preview
