import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-compact-listing-molecule',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './CompactListingMolecule.component.html',
})
export class CompactListingMoleculeComponent {
	title = input.required<string>()
	description = input('')
	imageSrc = input<string>()
	href = input<string>()
}
