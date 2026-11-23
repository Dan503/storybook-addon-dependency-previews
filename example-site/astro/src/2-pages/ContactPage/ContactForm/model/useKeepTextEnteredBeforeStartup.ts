import { useEffect } from 'react'
import type { FieldStore, RequiredPath, Schema } from '@formisch/react'

/**
 * Puts text that was already in a box when the form started up into the form's
 * values, so sending the form does not treat that text as blank.
 *
 * The page arrives with the form already drawn, and its script takes over a
 * moment later. Text can reach a box before then: Firefox puts typed text back
 * on reload, the browser can fill in saved details, and someone on a slow
 * connection can start typing. React leaves that text in the box but tells
 * Formisch nothing, so Formisch would still hold the empty starting value.
 */
export function useKeepTextEnteredBeforeStartup<
	TSchema extends Schema,
	TPath extends RequiredPath,
>(field: FieldStore<TSchema, TPath>, boxId: string) {
	// `field` and `boxId` never change for a box, so this runs once, when the box first appears.
	useEffect(() => {
		const box = document.getElementById(boxId) as
			HTMLInputElement | HTMLTextAreaElement | null
		const textInBox = box?.value
		const isBoxAndFieldOutOfSync = textInBox && textInBox !== field.input
		if (isBoxAndFieldOutOfSync) field.onChange(textInBox as typeof field.input)
	}, [field, boxId])
}
