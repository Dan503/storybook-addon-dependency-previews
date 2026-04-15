import { Component, input, TemplateRef } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'

@Component({
	selector: 'string-or-template-atom',
	template: `
		@if (isTemplateRef(value())) {
			<ng-container [ngTemplateOutlet]="asTemplateRef(value())"></ng-container>
		} @else {
			{{ value() }}
		}
	`,
	standalone: true,
	imports: [NgTemplateOutlet],
})
export class StringOrTemplateAtomComponent {
	value = input<string | TemplateRef<unknown>>('')

	isTemplateRef(val: string | TemplateRef<unknown>): val is TemplateRef<unknown> {
		return val instanceof TemplateRef
	}

	asTemplateRef(val: string | TemplateRef<unknown>): TemplateRef<unknown> {
		return val as TemplateRef<unknown>
	}
}
