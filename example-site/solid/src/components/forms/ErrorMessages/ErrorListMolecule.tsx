import { For } from 'solid-js'
import type { FormErrors } from '../FormTypes'
import { ErrorMessageAtom } from './ErrorMessageAtom'

export interface PropsForErrorListMolecule {
	errors: FormErrors
}

// The errors are read as `props.errors` inside `For` rather than mapped over
// once, so that errors arriving after the first draw still appear.
export function ErrorListMolecule(props: PropsForErrorListMolecule) {
	return (
		<ul class="grid gap-1 pl-6">
			<For each={props.errors ?? []}>
				{(err) => (
					<li class="list-disc list-outside">
						<ErrorMessageAtom error={err} />
					</li>
				)}
			</For>
		</ul>
	)
}
