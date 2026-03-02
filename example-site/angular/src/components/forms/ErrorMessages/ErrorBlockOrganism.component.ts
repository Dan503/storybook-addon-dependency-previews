import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ErrorListMoleculeComponent } from './ErrorListMolecule.component'

@Component({
	selector: 'app-error-block-organism',
	standalone: true,
	imports: [CommonModule, ErrorListMoleculeComponent],
	templateUrl: './ErrorBlockOrganism.component.html',
})
export class ErrorBlockOrganismComponent {
	title = input('Error')
	errors = input<Array<string>>([])
}
