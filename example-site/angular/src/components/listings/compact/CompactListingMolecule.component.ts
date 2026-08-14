import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
	getFullAddress,
	type HrefParams,
	type LinkAddress,
	type RouteAddress,
} from 'example-site-shared/utils';
import type { AngularComponentProps } from 'storybook-addon-dependency-previews';

@Component({
	selector: 'compact-listing-molecule',
	host: {
		'[class]': `["CompactListingMolecule", class()].join(" ")`,
	},
	// The row is written once and drawn by whichever branch runs below, so the
	// linked and plain forms cannot drift apart. Its grid also has to sit on its own
	// element rather than on the host: left on the host, the link would be the
	// host's only child, so the two-column grid would have one item in it.
	template: `
		<ng-template #row>
			<div class="grid grid-cols-[auto_1fr] items-center gap-4">
				<img [src]="imageSrc()" alt="" class="h-15" />
				<div>
					<h3 class="text-xl leading-none font-bold">{{ title() }}</h3>
					<p>{{ description() }}</p>
				</div>
			</div>
		</ng-template>
		@if (href()) {
			<a [href]="fullAddress()" class="block hover:underline">
				<ng-container [ngTemplateOutlet]="row" />
			</a>
		} @else {
			<ng-container [ngTemplateOutlet]="row" />
		}
	`,
	standalone: true,
	imports: [NgTemplateOutlet],
})
export class CompactListingMoleculeComponent {
	class = input<string>('');
	imageSrc = input<string>('');
	title = input<string>('');
	description = input<string>('');
	href = input<RouteAddress>();
	hrefParams = input<HrefParams>();
	protected fullAddress = computed(() => {
		const href = this.href();
		// Read only by the branch that has an address, so this empty text never
		// reaches a link.
		if (!href) return '';
		return getFullAddress({ href, hrefParams: this.hrefParams() });
	});
}

/**
 * What a compact listing row needs to draw itself.
 *
 * The address and its pieces come from the shared type rather than from the
 * component's inputs, and are optional: an item without an address draws as plain
 * content instead of a link.
 */
export type PropsForCompactListingMolecule = AngularComponentProps<
	CompactListingMoleculeComponent,
	'class' | 'href' | 'hrefParams'
> &
	Partial<LinkAddress>;
