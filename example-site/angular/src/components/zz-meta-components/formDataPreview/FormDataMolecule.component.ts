import { Component, input } from '@angular/core';
import { FormDataPreviewAtomComponent } from './FormDataPreviewAtom.component';

@Component({
	selector: 'form-data-molecule',
	host: {
		'[class]': `[
			"FormDataMolecule",
			"grid",
			"grid-cols-[minmax(0,1fr)]",
			"gap-2",
			class()
		].join(" ")`,
	},
	template: `
		<ng-content />
		<form-data-preview-atom [formValues]="formValues()" />
	`,
	standalone: true,
	imports: [FormDataPreviewAtomComponent],
})
export class FormDataMoleculeComponent {
	class = input<string>('');
	formValues = input<any>({});
}
