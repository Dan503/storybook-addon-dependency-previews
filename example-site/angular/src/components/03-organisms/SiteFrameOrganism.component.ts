import { Component } from '@angular/core'
import { HeaderOrganismComponent } from './HeaderOrganism.component'
import { FooterOrganismComponent } from './FooterOrganism.component'

@Component({
	selector: 'app-site-frame-organism',
	standalone: true,
	imports: [HeaderOrganismComponent, FooterOrganismComponent],
	templateUrl: './SiteFrameOrganism.component.html',
})
export class SiteFrameOrganismComponent {}
