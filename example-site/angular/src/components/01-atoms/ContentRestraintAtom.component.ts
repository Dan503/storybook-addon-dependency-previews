import { Component, input } from '@angular/core';
import { ScreenPaddingAtomComponent } from './ScreenPaddingAtom.component';

@Component({
	selector: 'content-restraint-atom',
	template: `
		<screen-padding-atom [class]="class()" [padVertical]="padVertical()">
			<div class="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]">
				<div class="width-full col-start-2 h-full">
					<ng-content />
				</div>
			</div>
		</screen-padding-atom>
	`,
	standalone: true,
	imports: [ScreenPaddingAtomComponent],
})
export class ContentRestraintAtomComponent {
	class = input<string>('');
	padVertical = input<boolean>(false);
}
