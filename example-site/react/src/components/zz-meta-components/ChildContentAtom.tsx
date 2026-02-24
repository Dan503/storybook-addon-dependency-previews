export interface PropsForChildContentAtom {}

export function ChildContentAtom({}: PropsForChildContentAtom) {
	return (
		<div className="ChildContentAtom bg-gray-200 border-2 border-dashed rounded-md text-black p-4 min-h-60 grid place-items-center">
			<p>Placeholder child content</p>
		</div>
	)
}
