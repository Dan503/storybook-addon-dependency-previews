import React from "react"
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
			<h2>{children}</h2>
		</div>
	)
}
