import type { ContactFormValues } from 'example-site-shared/data'
import type { FieldRenderProps, FormProps } from 'react-final-form'

export type SupportedInputs = 'input' | 'select' | 'textarea'

export type ContactForm = FormProps<ContactFormValues>

export type TextInputProps = FieldRenderProps<string, HTMLInputElement>
export type TextAreaProps = FieldRenderProps<string, HTMLTextAreaElement>

export interface FinalFormInputProps<
	FieldValue,
	Elem extends HTMLElement,
	DisplayValue = FieldValue,
> {
	name: string
	input: FieldRenderProps<DisplayValue, Elem>['input']
	meta: FieldRenderProps<FieldValue, Elem>['meta']
}
