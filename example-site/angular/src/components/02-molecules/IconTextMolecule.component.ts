import { Component, input } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import type { IconComponent, IconProps } from '../01-atoms/icons/iconTypes'

@Component({
	selector: 'icon-text-molecule',
	template: `
		<p class="IconTextMolecule flex items-center gap-1 text-lg font-medium text-gray-900">
			<ng-container *ngComponentOutlet="icon(); inputs: iconInputs" />
			{{ text() }}
		</p>
	`,
	standalone: true,
	imports: [NgComponentOutlet],
})
export class IconTextMoleculeComponent {
	icon = input.required<IconComponent>()
	text = input<string>('')
	protected readonly iconInputs: IconProps = { class: 'h-[1em] w-[1em]' }
}
