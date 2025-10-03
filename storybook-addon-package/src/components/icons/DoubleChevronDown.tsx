import type { IconProps } from './iconTypes'
import { Svg } from './Svg'

export function DoubleChevronDown(props: IconProps) {
	return (
		<Svg {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
			/>
		</Svg>
	)
}
