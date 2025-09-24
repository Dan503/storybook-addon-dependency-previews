import type { Preview } from 'storybook'

const preview: Preview = {
	parameters: {
		docs: {
			page: () => (
				<>
					<Title />
					<Subtitle />
					<Description />
					<Primary />
					<Controls />
					<DependencyPreviews />
					<Stories />
				</>
			),
		},
	},
}

export default preview
