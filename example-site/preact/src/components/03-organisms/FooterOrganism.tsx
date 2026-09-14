import type { ComponentChildren } from 'preact'

export interface PropsForFooterOrganism {
	children?: ComponentChildren
}

export function FooterOrganism({ children }: PropsForFooterOrganism) {
	return (
		<div class="FooterOrganism border-t-2 border-teal-900 bg-teal-200 p-4 text-center text-black">
			<p>
				Meal data provided by{' '}
				<a
					href="https://www.themealdb.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="underline hover:no-underline focus:no-underline"
				>
					TheMealDB.com
				</a>
			</p>
			{children}
		</div>
	)
}
