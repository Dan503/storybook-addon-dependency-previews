import { Component, input } from '@angular/core';
import type { AngularComponentProps } from 'storybook-addon-dependency-previews';

@Component({
	selector: 'compact-listing-molecule',
	template: `
		<div
			[class]="'CompactListingMolecule grid grid-cols-[auto_1fr] items-center gap-4 ' + class()"
		>
			<img [src]="imageSrc()" alt="" class="h-15" />
			<div>
				<h3 class="text-xl leading-none font-bold">{{ title() }}</h3>
				<p>{{ description() }}</p>
			</div>
		</div>
	`,
	standalone: true,
	imports: [],
})
export class CompactListingMoleculeComponent {
	class = input<string>('');
	imageSrc = input<string>('');
	title = input<string>('');
	description = input<string>('');
	href = input<string>('');
}

export type PropsForCompactListingMolecule = AngularComponentProps<
	CompactListingMoleculeComponent,
	'class'
>;
