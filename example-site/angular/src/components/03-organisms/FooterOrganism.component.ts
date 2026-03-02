import { Component } from '@angular/core'
import { ExternalLinkAtomComponent } from '../01-atoms/ExternalLinkAtom.component'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'

@Component({
	selector: 'app-footer-organism',
	standalone: true,
	imports: [ExternalLinkAtomComponent, ScreenPaddingAtomComponent],
	templateUrl: './FooterOrganism.component.html',
})
export class FooterOrganismComponent {}
