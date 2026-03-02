import { Component, input } from '@angular/core'

@Component({
	selector: 'app-external-link-icon',
	standalone: true,
	template: `
		<svg
			[attr.aria-label]="ariaLabel() || null"
			[attr.aria-hidden]="!ariaLabel()"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			[style.width]="size()"
			[style.height]="size()"
		>
			<path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM3 5h8v2H5v12h12v-6h2v8H3V5z" />
		</svg>
	`,
})
export class ExternalLinkIconComponent {
	ariaLabel = input('')
	size = input('1em')
}
