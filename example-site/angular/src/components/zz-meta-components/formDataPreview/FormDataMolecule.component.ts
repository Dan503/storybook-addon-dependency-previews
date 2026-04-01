import { Component, input } from '@angular/core';
import { FormDataPreviewAtomComponent } from './FormDataPreviewAtom.component';

@Component({
	selector: 'form-data-molecule',
	template: `
		<div [class]="'FormDataMolecule grid grid-cols-[minmax(0,1fr)] gap-2 ' + class()">
			<ng-content />
			<form-data-preview-atom [formValues]="formValues()" />
		</div>
	`,
	standalone: true,
	imports: [FormDataPreviewAtomComponent],
})
export class FormDataMoleculeComponent {
	class = input<string>('');
	formValues = input<any>({});
}
