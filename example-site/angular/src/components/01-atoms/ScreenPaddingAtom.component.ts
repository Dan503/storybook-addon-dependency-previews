import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'screen-padding-atom',
	template: `
		<div
			[class]="'ScreenPaddingAtom w-full ' + class()"
			[class.p-6]="padVertical()"
			[class.px-6]="!padVertical()"
		>
			<ng-content />
		</div>
	`,
	standalone: true,
	imports: [CommonModule],
})
export class ScreenPaddingAtomComponent {
	class = input<string>('');
	padVertical = input<boolean>(false);
}
