import { Component, input } from '@angular/core';

@Component({
	selector: 'bg-image-container-atom',
	host: {
		'[class]': '["BgImageContainerAtom", "relative", "h-full", "min-h-50", class()].join(" ")',
	},
	template: `
		<img
			[src]="imgSrc()"
			[alt]="altText()"
			class="absolute top-0 left-0 h-full w-full object-cover"
		/>
		<div
			class="absolute inset-0"
			[style]="
				['background-color: ' + tintColor(), 'opacity: ' + tintPercent() / 100].join('; ')
			"
		></div>
		<div [class]="'relative z-10 grid place-items-center h-full ' + innerClass()">
			<ng-content />
		</div>
	`,
	standalone: true,
	imports: [],
})
export class BgImageContainerAtomComponent {
	class = input<string>('');
	innerClass = input<string>('');
	imgSrc = input<string>();
	altText = input<string>('');
	tintColor = input<string>('white');
	tintPercent = input<number>(70);
}
