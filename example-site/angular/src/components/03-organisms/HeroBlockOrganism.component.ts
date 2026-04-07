import { Component, input, TemplateRef } from '@angular/core';
import { BgImageContainerAtomComponent } from '../01-atoms/BgImageContainerAtom.component';
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component';
import { StringOrTemplateAtomComponent } from '../01-atoms/StringOrTemplateAtom.component';

@Component({
	selector: 'hero-block-organism',
	template: `
		<bg-image-container-atom
			[imgSrc]="imgSrc()"
			[tintPercent]="tintPercentage()"
			[tintColor]="tintColor()"
		>
			<screen-padding-atom [padVertical]="true">
				<h1 class="text-4xl font-bold text-center">
					<string-or-template-atom [value]="title()" />
				</h1>
				<ng-content />
			</screen-padding-atom>
		</bg-image-container-atom>
	`,
	standalone: true,
	imports: [
		BgImageContainerAtomComponent,
		ScreenPaddingAtomComponent,
		StringOrTemplateAtomComponent,
	],
})
export class HeroBlockOrganismComponent {
	class = input<string>('');
	title = input<string | TemplateRef<unknown>>('');
	imgSrc = input<string>();
	tintPercentage = input<number>(70);
	tintColor = input<string>('white');
	altText = input<string>('');
}
