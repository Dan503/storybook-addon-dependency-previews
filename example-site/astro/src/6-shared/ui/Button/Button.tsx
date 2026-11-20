import type { MouseEvent, ReactNode } from 'react'
import styles from './Button.module.css'

export interface PropsForButton {
	/** What the button does inside a form. Defaults to "button", which does nothing until `onClick` is set. */
	type?: 'button' | 'submit' | 'reset'
	/** Runs when the button is clicked. */
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
	/** The button's text. */
	children: ReactNode
}

/** A clickable button. Set its type to "submit" to make it send the form it sits in. */
export function Button({ children, type = 'button', onClick }: PropsForButton) {
	return (
		<button type={type} onClick={onClick} className={styles.button}>
			{children}
		</button>
	)
}
