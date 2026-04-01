import { Component, input } from '@angular/core';

@Component({
	selector: 'form-data-preview-atom',
	template: `
		<pre
			class="overflow-auto bg-gray-200 rounded-lg p-2"
		><code>{{ stringify(formValues()) }}</code></pre>
	`,
	standalone: true,
	imports: [],
})
export class FormDataPreviewAtomComponent {
	class = input<string>('');
	formValues = input<any>({});
	stringify = (obj: any) => JSON.stringify(obj, null, 3);
}
