import { Component, input } from '@angular/core';
import { HeaderOrganismComponent } from './HeaderOrganism.component';
import { FooterOrganismComponent } from './FooterOrganism.component';

@Component({
	selector: 'site-frame-organism',
	host: {
		'[class]': `[
			"SiteFrameOrganism",
			"grid",
			"min-h-screen",
			"grid-rows-[auto_1fr_auto]",
			class()
		].join(" ")`,
	},
	template: `
		<header-organism />
		<div class="grid flex-1">
			<ng-content />
		</div>
		<footer-organism />
	`,
	standalone: true,
	imports: [HeaderOrganismComponent, FooterOrganismComponent],
})
export class SiteFrameOrganismComponent {
	class = input<string>('');
}
