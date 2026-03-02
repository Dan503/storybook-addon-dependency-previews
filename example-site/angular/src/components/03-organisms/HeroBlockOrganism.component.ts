import { Component, input } from '@angular/core'
import { BgImageContainerAtomComponent } from '../01-atoms/BgImageContainerAtom.component'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'

@Component({
	selector: 'app-hero-block-organism',
	standalone: true,
	imports: [BgImageContainerAtomComponent, ScreenPaddingAtomComponent],
	templateUrl: './HeroBlockOrganism.component.html',
})
export class HeroBlockOrganismComponent {
	title = input.required<string>()
	imgSrc = input<string>()
	tintPercent = input(70)
	tintColor = input('white')
	altText = input('')
}
