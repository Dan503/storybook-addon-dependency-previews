import { Component, input } from '@angular/core'
import { ScreenPaddingAtomComponent } from './ScreenPaddingAtom.component'

@Component({
	selector: 'app-content-restraint-atom',
	standalone: true,
	imports: [ScreenPaddingAtomComponent],
	templateUrl: './ContentRestraintAtom.component.html',
})
export class ContentRestraintAtomComponent {
	padVertical = input(false)
}
