import { Component, input } from '@angular/core';

@Component({
	selector: 'button-atom',
	template: `
		<button
			[type]="type()"
			(click)="onClick()()"
			[class]="
				'ButtonAtom rounded-lg border-2 border-teal-900 bg-teal-200 px-4 py-1 hover:bg-teal-100 focus-visible:bg-teal-100 ' +
				class()
			"
		>
			<ng-content />
		</button>
	`,
	standalone: true,
})
export class ButtonAtomComponent {
	class = input<string>('');
	onClick = input<() => void>(() => {});
	type = input<string>('button');
}
