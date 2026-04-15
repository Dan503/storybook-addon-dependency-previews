import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'screen-padding-atom',
	host: {
		'[class]': '["ScreenPaddingAtom", "w-full", class()].join(" ")',
		'[class.p-6]': 'padVertical()',
		'[class.px-6]': '!padVertical()',
	},
	template: `
		<ng-content />
	`,
	standalone: true,
	imports: [CommonModule],
})
export class ScreenPaddingAtomComponent {
	class = input<string>('');
	padVertical = input<boolean>(false);
}
