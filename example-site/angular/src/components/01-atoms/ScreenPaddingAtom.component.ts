import { Component, input } from '@angular/core'

@Component({
	selector: 'app-screen-padding-atom',
	standalone: true,
	template: `
		<div [class]="padVertical() ? 'px-6 py-6' : 'px-6'">
			<ng-content />
		</div>
	`,
})
export class ScreenPaddingAtomComponent {
	padVertical = input(false)
}
