import { Component, input } from '@angular/core';

@Component({
	selector: 'form-data-preview-atom',
	template: ` <pre class="overflow-auto"><code>{{ stringify(formValues()) }}</code></pre> `,
	standalone: true,
	imports: [],
})
export class FormDataPreviewAtomComponent {
	class = input<string>('');
	formValues = input<any>({});
	stringify = (obj: any) => JSON.stringify(obj, null, 3);
}
