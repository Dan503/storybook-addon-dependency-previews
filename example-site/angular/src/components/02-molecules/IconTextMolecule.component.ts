import { Component } from '@angular/core'

@Component({
	selector: 'app-icon-text-molecule',
	standalone: true,
	template: `
		<div class="IconTextMolecule flex items-center gap-2">
			<ng-content select="[icon]" />
			<ng-content />
		</div>
	`,
})
export class IconTextMoleculeComponent {}
