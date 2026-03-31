import { Component, computed, input } from '@angular/core'
import { injectField, TanStackAppField } from '@tanstack/angular-form'
import { ErrorListMoleculeComponent } from '../ErrorMessages/ErrorListMolecule.component'

@Component({
	selector: 'text-field-molecule',
	hostDirectives: [
		{
			directive: TanStackAppField,
			inputs: ['tanstackField', 'name'],
		},
	],
	template: `
		@if (fieldApi()) {
			<div class="TextFieldMolecule">
				<label [for]="id()" class="mb-1 grid gap-2">
					<span class="text-xl font-bold">{{ label() }}</span>
					<input
						[id]="id()"
						[value]="fieldApi()!.state.value"
						[placeholder]="placeholder() ?? ''"
						(blur)="fieldApi()!.handleBlur()"
						(input)="fieldApi()!.handleChange($any($event).target.value)"
						[class]="inputClass()"
					/>
				</label>
				@if (showErrors()) {
					<error-list-molecule [errors]="fieldApi()!.state.meta.errors" />
				}
			</div>
		}
	`,
	standalone: true,
	imports: [ErrorListMoleculeComponent],
})
export class TextFieldMoleculeComponent {
	label = input.required<string>()
	placeholder = input<string>()

	protected field = injectField<string>()
	protected fieldApi = computed(() => this.field._api())

	protected id = computed(() => this.fieldApi().name.replace(/\W/g, ''))
	protected showErrors = computed(
		() => this.fieldApi().state.meta.isTouched && this.fieldApi().state.meta.errors.length > 0,
	)
	protected inputClass = computed(() => {
		const base =
			'w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
		return this.showErrors()
			? `${base} border-red-600 text-red-900 placeholder-red-900/60`
			: base
	})
}
