import { useEffect, useState } from 'react'

export function useAnimatedMount(isOpen: boolean, durationMs = 300) {
	const [isRendered, setIsRendered] = useState(isOpen)
	const [animationState, setAnimationState] = useState<'open' | 'closed'>(
		isOpen ? 'open' : 'closed',
	)

	useEffect(() => {
		if (isOpen) {
			// mount, then flip to "open" on next frame so CSS can animate
			setIsRendered(true)
			requestAnimationFrame(() => setAnimationState('open'))
			return
		}
		// start fade-out
		setAnimationState('closed')
		const t = setTimeout(() => setIsRendered(false), durationMs)
		return () => clearTimeout(t)
	}, [isOpen, durationMs])

	return { isRendered, animationState }
}
