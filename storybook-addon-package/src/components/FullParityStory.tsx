// FullParityStory.tsx — preview-only, no Storybook UI
import IframeResizer from '@iframe-resizer/react'
import * as React from 'react'

type Props = {
	/** docs id like "...--docs" or a canvas id like "...--primary" */
	storyId: string
	args?: Record<string, unknown>
	globals?: Record<string, unknown>
	className?: string
	onLoad?: () => void
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
	className,
	onLoad,
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

	return (
		<IframeResizer
			title={canvasId}
			license="GPLv3"
			log="collapsed"
			src={src}
			loading="lazy"
			className={className}
			onLoad={onLoad}
			style={{
				width: '100%',
				border: '1px solid var(--sb-border-color, #e5e7eb)',
				borderRadius: 8,
				background: 'transparent',
			}}
		/>
	)
}
