import { Component, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import type { IconComponent, IconProps } from '../01-atoms/icons/iconTypes';

@Component({
	selector: 'icon-text-molecule',
	host: { '[class]': '["IconTextMolecule", class()].join(" ")' },
	template: `
		<p class="flex items-center gap-1 text-lg font-medium text-gray-900">
			<ng-container *ngComponentOutlet="icon()" />
			{{ text() }}
		</p>
	`,
	standalone: true,
	imports: [NgComponentOutlet],
})
export class IconTextMoleculeComponent {
	class = input<string>('');
	icon = input.required<IconComponent>();
	text = input<string>('');
	protected readonly iconInputs: IconProps = { class: 'h-[1em] w-[1em]' };
}
