import 'react'

declare module 'react' {
	// Add missing attributes for Popover API and Anchor positioning
	interface HTMLAttributes<T> {
		popover?: '' | 'auto' | 'manual' | undefined
		anchor?: string
	}
}
