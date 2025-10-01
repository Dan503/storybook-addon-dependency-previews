// FullParityStory.tsx — preview-only, no Storybook UI
import * as React from 'react'

type Props = {
	/** docs id like "...--docs" or a canvas id like "...--primary" */
	storyId: string
	args?: Record<string, unknown>
	globals?: Record<string, unknown>
	enabled?: boolean
	initialHeight?: number
	className?: string
}

const toCanvasId = (id: string) =>
	id.endsWith('--docs') ? id.replace(/--docs$/, '--primary') : id

const enc = (obj?: Record<string, unknown>) =>
	obj && Object.keys(obj).length
		? encodeURIComponent(JSON.stringify(obj))
		: ''

export function FullParityStory({
	storyId,
	args,
	globals,
	enabled = true,
	initialHeight = 120,
	className,
}: Props) {
	const canvasId = React.useMemo(() => toCanvasId(storyId), [storyId])

	const src = React.useMemo(() => {
		// ⚠️ This is the preview-only route, no manager UI
		const a = enc(args)
		const g = enc(globals)
		const qs = [
			`id=${canvasId}`,
			'viewMode=story',
			a && `args=${a}`,
			g && `globals=${g}`,
		]
			.filter(Boolean)
			.join('&')
		return `iframe.html?${qs}`
	}, [canvasId, args, globals])

	const ref = React.useRef<HTMLIFrameElement>(null)
	const [height, setHeight] = React.useState(initialHeight)

	React.useEffect(() => {
		if (!enabled) return
		const iframe = ref.current
		if (!iframe) return

		let ro: ResizeObserver | null = null
		const onLoad = () => {
			try {
				const doc =
					iframe.contentDocument || iframe.contentWindow?.document
				const target = doc?.documentElement || doc?.body
				if (!target || typeof ResizeObserver === 'undefined') return
				ro = new ResizeObserver(() => {
					const h = Math.max(
						target.scrollHeight,
						target.clientHeight,
						target.getBoundingClientRect().height,
					)
					if (h && Math.abs(h - height) > 2) setHeight(h)
				})
				ro.observe(target)
			} catch {
				/* same-origin guard */
			}
		}

		iframe.addEventListener('load', onLoad)
		return () => {
			iframe.removeEventListener('load', onLoad)
			ro?.disconnect()
		}
	}, [enabled, height])

	if (!enabled) return null

	return (
		<iframe
			ref={ref}
			src={src}
			title={canvasId}
			loading="lazy"
			style={{
				width: '100%',
				height,
				border: '1px solid var(--sb-border-color, #e5e7eb)',
				borderRadius: 8,
				background: 'transparent',
			}}
			className={className}
		/>
	)
}
