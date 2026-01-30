import { Heading } from '@storybook/addon-docs/blocks'
import s from './SbHeading.module.css'
import type { ReactNode } from 'react'

interface PropsForSbHeading {
	className?: string
	children?: ReactNode
}

export function SbHeading({ children, className }: PropsForSbHeading) {
	const classes = [s.SbHeading, className].filter(Boolean).join(' ').trim()
	return (
		<div className={classes}>
			<Heading>{children}</Heading>
		</div>
	)
}
