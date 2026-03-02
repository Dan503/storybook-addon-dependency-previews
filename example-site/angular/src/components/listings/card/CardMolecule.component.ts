import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'

export interface CardItem {
	title: string
	imgSrc: string
	description: string
	href: string
}

@Component({
	selector: 'app-card-molecule',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './CardMolecule.component.html',
})
export class CardMoleculeComponent {
	title = input.required<string>()
	imgSrc = input.required<string>()
	description = input.required<string>()
	href = input.required<string>()
}
