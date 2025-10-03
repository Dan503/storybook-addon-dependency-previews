import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export function useElemDimensions<Elem extends HTMLElement>(open: boolean) {
	const ref = useRef<Elem | null>(null)
	const [rect, setRect] = useState<DOMRect | null>(null)

	const updateRect = useCallback(
		() => setRect(ref.current!.getBoundingClientRect()),
		[],
	)

	useLayoutEffect(() => {
		if (!open || !ref.current) return
		updateRect()
		// keep it positioned if the page resizes or scrolls
		window.addEventListener('resize', updateRect)
		window.addEventListener('scroll', updateRect, true)
		return () => {
			window.removeEventListener('resize', updateRect)
			window.removeEventListener('scroll', updateRect, true)
		}
	}, [open])

	return { ref, rect, updateRect }
}
