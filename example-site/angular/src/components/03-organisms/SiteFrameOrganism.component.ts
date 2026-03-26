import { Component, input } from '@angular/core';
import { HeaderOrganismComponent } from './HeaderOrganism.component';
import { FooterOrganismComponent } from './FooterOrganism.component';

@Component({
	selector: 'site-frame-organism',
	template: `
		<div [class]="'SiteFrameOrganism grid min-h-full grid-rows-[auto_1fr_auto] ' + class()">
			<header-organism />
			<div class="grid flex-1">
				<ng-content />
			</div>
			<footer-organism />
		</div>
	`,
	standalone: true,
	imports: [HeaderOrganismComponent, FooterOrganismComponent],
})
export class SiteFrameOrganismComponent {
	class = input<string>('');
}
