import type { MouseEvent, ReactNode } from 'react'
import styles from './Button.module.css'

export interface PropsForButton {
	type?: 'button' | 'submit' | 'reset'
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
	children: ReactNode
}

export function Button({ children, type = 'button', onClick }: PropsForButton) {
	return (
		<button type={type} onClick={onClick} className={styles.button}>
			{children}
		</button>
	)
}
