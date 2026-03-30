import { Component, input } from '@angular/core';
import type { AngularComponentProps } from 'storybook-addon-dependency-previews';

@Component({
	selector: 'card-molecule',
	template: `
		<div [class]="'CardMolecule @container grid ' + class()">
			<a
				[href]="href()"
				class="grid @max-sm:grid-rows-[auto_1fr] @min-sm:grid-cols-[200px_1fr] h-full @min-sm:gap-2 overflow-hidden rounded-2xl border bg-white transition-all hover:transform-[scale(1.02)] hover:bg-teal-200 hover:shadow-lg focus:bg-teal-200"
			>
				<img [src]="imgSrc()" alt="" class="aspect-video object-cover h-full" />
				<div class="w-full p-4">
					<h3 class="text-xl font-bold">{{ title() }}</h3>
					<p class="line-clamp-4">{{ description() }}</p>
				</div>
			</a>
		</div>
	`,
	standalone: true,
	imports: [],
	styles: ``,
})
export class CardMoleculeComponent {
	class = input<string>('');
	title = input<string>('');
	imgSrc = input<string>('');
	description = input<string>('');
	href = input<string>('');
}

export type PropsForCardMolecule = AngularComponentProps<CardMoleculeComponent, 'class'>
