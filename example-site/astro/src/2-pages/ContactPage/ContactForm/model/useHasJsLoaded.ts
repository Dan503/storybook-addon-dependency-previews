import { useEffect, useState } from 'react'

export function useHasJsLoaded() {
	const [hasJsLoaded, setHasJsLoaded] = useState(false)
	useEffect(() => {
		setHasJsLoaded(true)
	}, [])
	return hasJsLoaded
}
