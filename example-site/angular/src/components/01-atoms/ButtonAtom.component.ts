import { Component, input, output } from '@angular/core'

@Component({
	selector: 'app-button-atom',
	standalone: true,
	template: `
		<button
			[type]="type()"
			(click)="onClick.emit($event)"
			class="rounded-lg border-2 border-teal-900 bg-teal-200 px-4 py-1 hover:bg-teal-100 focus:bg-teal-100"
		>
			<ng-content />
		</button>
	`,
})
export class ButtonAtomComponent {
	type = input<'button' | 'submit' | 'reset'>('button')
	onClick = output<MouseEvent>()
}
