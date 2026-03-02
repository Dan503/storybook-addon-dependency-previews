import { Component, input } from '@angular/core'
import { JsonPipe } from '@angular/common'

@Component({
	selector: 'app-form-data-preview-atom',
	standalone: true,
	imports: [JsonPipe],
	template: `
		<pre class="FormDataPreviewAtom bg-gray-100 border border-gray-300 rounded p-4 text-sm overflow-auto">{{ formValues() | json }}</pre>
	`,
})
export class FormDataPreviewAtomComponent {
	formValues = input<unknown>({})
}
