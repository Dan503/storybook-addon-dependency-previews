<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import type { IconProps } from './iconTypes';

	interface SvgProps extends IconProps {
		children?: Snippet;
	}

	const { altText, class: className, children }: SvgProps = $props();

	const staticAttrs: SVGAttributes<SVGElement> = {
		xmlns: 'http://www.w3.org/2000/svg',
		fill: 'none',
		viewBox: '0 0 24 24',
		'stroke-width': 1.5,
		stroke: 'currentColor',
		height: 24,
		width: 24,
		focusable: 'false'
	};

	function defaultIconAttributes(altText?: string): SVGAttributes<SVGElement> {
		return {
			...staticAttrs,
			role: 'img',
			'aria-label': altText ? altText : undefined,
			'aria-hidden': altText ? undefined : true
		};
	}
</script>

<svg {...defaultIconAttributes(altText)} class={className}>
	{@render children?.()}
</svg>
