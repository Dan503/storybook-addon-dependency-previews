import { Component, input } from '@angular/core';

@Component({
	selector: 'child-content-atom',
	host: {
		'[class]': `[
			"ChildContentAtom",
			"grid",
			"min-h-60",
			"place-items-center",
			"rounded-md",
			"border-2",
			"border-dashed",
			"bg-gray-200",
			"p-4",
			"text-black",
			class()
		].join(" ")`,
	},
	template: `
		<p>Placeholder child content</p>
	`,
	standalone: true,
})
export class ChildContentAtomComponent {
	class = input<string>('');
}
