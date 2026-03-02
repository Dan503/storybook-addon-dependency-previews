import { Component, input } from '@angular/core'
import { NgStyle } from '@angular/common'

@Component({
	selector: 'app-bg-image-container-atom',
	standalone: true,
	imports: [NgStyle],
	templateUrl: './BgImageContainerAtom.component.html',
})
export class BgImageContainerAtomComponent {
	imgSrc = input<string>()
	altText = input('')
	className = input('')
	innerClassName = input('')
	tintColor = input('white')
	tintPercent = input(70)
}
