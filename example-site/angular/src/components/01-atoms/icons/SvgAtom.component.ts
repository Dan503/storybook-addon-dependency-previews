import { Component, input } from '@angular/core';

@Component({
  selector: 'svg-atom',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      [attr.viewBox]="['0', '0', size(), size()].join(' ')"
      stroke-width="1.5"
      stroke="currentColor"
      [attr.height]="size()"
      [attr.width]="size()"
      focusable="false"
      role="img"
      [class]="class()"
      [attr.aria-label]="altText() ?? null"
      [attr.aria-hidden]="altText() ? null : true"
    >
      <ng-content />
    </svg>
  `,
})
export class SvgAtomComponent {
  altText = input<string>();
  class = input<string>();
  size = input<number>(24);
}
