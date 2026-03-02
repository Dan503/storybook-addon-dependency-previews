import { Component } from '@angular/core'

@Component({
	selector: 'app-child-content-atom',
	standalone: true,
	template: `
		<div class="ChildContentAtom bg-teal-50 border-2 border-dashed border-teal-400 p-8 text-center text-teal-700">
			<p>Child content placeholder</p>
		</div>
	`,
})
export class ChildContentAtomComponent {}
