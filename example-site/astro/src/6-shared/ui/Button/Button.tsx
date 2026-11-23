import type { MouseEvent, ReactNode } from 'react'
import styles from './Button.module.css'

export interface PropsForButton {
	/** What the button does inside a form. Defaults to "button", which does nothing until `onClick` is set. */
	type?: 'button' | 'submit' | 'reset'
	/** Runs when the button is clicked. */
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
	/** Reason for why the button is unable to be clicked. */
	disabledReason?: string | false | null
	/** The button's text. */
	children: ReactNode
}

/**
 * Firefox remembers whether a button was switched off and puts that back when
 * the page reloads, before the page's script takes over. React then finds the
 * button different from what it drew and leaves it that way. "off" stops
 * Firefox doing this. React's types leave `autoComplete` out for buttons,
 * though React still writes it onto the page, so it is passed in a spread.
 */
const stopFirefoxRestoringButtonState = { autoComplete: 'off' }

/** A clickable button. Set its type to "submit" to make it send the form it sits in. */
export function Button({
	children,
	type = 'button',
	onClick,
	disabledReason,
}: PropsForButton) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={Boolean(disabledReason)}
			className={styles.button}
			{...stopFirefoxRestoringButtonState}
		>
			{disabledReason || children}
		</button>
	)
}
