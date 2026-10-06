import { html } from 'lit'

/*
 * Used by `.storybook/preview.ts` to wrap every story. It lives here rather than
 * there so the type check and lit-analyzer both read it: neither looks inside
 * `.storybook`.
 */

/**
 * Draws a story inside a wrapper that stops a link clicked in it from going
 * anywhere.
 *
 * The wrapper is `display: contents`, which keeps it out of the layout, so the
 * full-height chain from the page down to the template is not broken.
 *
 * @param storyContent - what the story draws
 */
export function renderStoryWithLinksStopped(storyContent: unknown) {
	return html`<div style="display: contents" @click=${stopLinksLeavingTheStory}>
		${storyContent}
	</div>`
}

/**
 * Stops a link clicked inside a story from going anywhere.
 *
 * In the site the router catches a click on a link inside it and draws the new
 * page without reloading. A story has no router, so the browser follows the
 * link itself and loads the site's address in the story's place — which
 * Storybook does not have, so the story is replaced by "Not Found".
 *
 * The tests below mirror the router's own, so that exactly the clicks it would
 * have claimed are the ones stopped. Everything it ignores is left to the
 * browser and still behaves normally: a click with ctrl, cmd or shift held,
 * one with any button but the main one, a link to another site or an email
 * address, a link aimed at another tab or window, and a download.
 *
 * The link is found through the click's full path rather than by walking up
 * from where the click landed, because the links sit inside the components'
 * shadow roots, which walking up from the outside cannot see into.
 *
 * @param event - the click
 */
function stopLinksLeavingTheStory(event: MouseEvent) {
	const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey
	const isMainButton = event.button === 0
	if (event.defaultPrevented || isModifiedClick || !isMainButton) return

	const clickedLink = event
		.composedPath()
		.find(
			(node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement,
		)
	if (!clickedLink) return

	const doesOpenElsewhere =
		clickedLink.target !== '' ||
		clickedLink.hasAttribute('download') ||
		clickedLink.getAttribute('rel') === 'external'
	const isEmailOrEmpty =
		clickedLink.href === '' || clickedLink.href.startsWith('mailto:')
	const isInsideThisSite = clickedLink.origin === location.origin
	if (doesOpenElsewhere || isEmailOrEmpty || !isInsideThisSite) return

	event.preventDefault()
}
