import { Component, computed, effect, input } from '@angular/core';
import { injectField, TanStackAppField } from '@tanstack/angular-form';
import { ErrorListMoleculeComponent } from '../ErrorMessages/ErrorListMolecule.component';

@Component({
	selector: 'text-field-molecule',
	host: { '[class]': '["TextFieldMolecule", class()].join(" ")' },
	hostDirectives: [
		{
			directive: TanStackAppField,
			inputs: ['tanstackField', 'name', 'validators', 'listeners', 'defaultMeta'],
		},
	],
	template: `
		@if (fieldApi()) {
			@let hasErrors =
				fieldApi()!.state.meta.isTouched && fieldApi()!.state.meta.errors.length > 0;
			<label [for]="id()" class="mb-1 grid gap-2">
				<span class="text-xl font-bold">{{ label() }}</span>
				<input
					[id]="id()"
					[value]="fieldApi()!.state.value"
					[placeholder]="placeholder() ?? ''"
					(blur)="fieldApi()!.handleBlur()"
					(input)="fieldApi()!.handleChange($any($event).target.value)"
					[class]="getInputClass(hasErrors)"
				/>
			</label>
			@if (hasErrors) {
				<error-list-molecule [errors]="fieldApi()!.state.meta.errors" />
			}
		}
	`,
	standalone: true,
	imports: [ErrorListMoleculeComponent],
})
export class TextFieldMoleculeComponent {
	class = input<string>('');
	label = input.required<string>();
	placeholder = input<string>();
	required = input<boolean>(false);

	protected field = injectField<string>();
	protected fieldApi = computed(() => this.field._api());
	protected id = computed(() => this.fieldApi().name.replace(/\W/g, ''));

	protected getInputClass(hasErrors: boolean): string {
		const base =
			'w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none';
		return hasErrors ? `${base} border-red-600 text-red-900 placeholder-red-900/60` : base;
	}

	constructor() {
		effect(() => {
			if (!this.required()) return;
			const api = this.fieldApi();
			if (!api) return;
			api.handleChange(api.state.value as string);
			api.handleBlur();
		});
	}
}
