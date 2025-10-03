import type { IconProps } from './iconTypes'
import { Svg } from './Svg'

export function X(props: IconProps) {
	return (
		<Svg {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6 18 18 6M6 6l12 12"
			/>
		</Svg>
	)
}
