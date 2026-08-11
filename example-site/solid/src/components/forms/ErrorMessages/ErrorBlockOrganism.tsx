import { Show } from 'solid-js'
import { ErrorListMolecule } from './ErrorListMolecule'
import type { FormErrors } from '../FormTypes'

export interface PropsForErrorBlockOrganism {
	errors: FormErrors
}

// The errors are read as `props.errors` rather than pulled out into their own
// variable, and the block is hidden with `Show` rather than an early return, so
// that errors arriving after the first draw still appear.
export function ErrorBlockOrganism(props: PropsForErrorBlockOrganism) {
	return (
		<Show when={props.errors?.length}>
			<div role="alert" class="bg-red-100 px-4 pt-2 rounded-xl">
				<h2 class="text-2xl font-bold border-b-2 border-red-800 pb-1">
					Please resolve the following errors
				</h2>
				<div class="pt-3 pb-4">
					<ErrorListMolecule errors={props.errors} />
				</div>
			</div>
		</Show>
	)
}
