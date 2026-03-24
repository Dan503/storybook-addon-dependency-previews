import { Component, input } from '@angular/core';
import { SvgAtomComponent } from './SvgAtom.component';

@Component({
  selector: 'external-link-icon',
  template: `
    <svg-atom [class]="'ExternalLinkIcon ' + class()" [altText]="altText()">
      <svg:path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg-atom>
  `,
  standalone: true,
  imports: [SvgAtomComponent],
})
export class ExternalLinkIconComponent {
  class = input<string>('');
  altText = input<string>('External');
}
