import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'
import { MainNavMoleculeComponent } from '../02-molecules/MainNavMolecule.component'

@Component({
	selector: 'app-header-organism',
	standalone: true,
	imports: [RouterLink, ScreenPaddingAtomComponent, MainNavMoleculeComponent],
	templateUrl: './HeaderOrganism.component.html',
})
export class HeaderOrganismComponent {}
