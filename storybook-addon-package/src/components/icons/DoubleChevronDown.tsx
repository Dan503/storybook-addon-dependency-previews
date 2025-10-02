import type { IconProps } from './iconTypes'

export function DoubleChevronDown({ className }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			height={20}
			width={20}
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
			/>
		</svg>
	)
}
