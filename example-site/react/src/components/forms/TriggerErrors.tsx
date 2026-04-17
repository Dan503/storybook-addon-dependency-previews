import { useEffect } from 'react'
import { useForm } from 'react-final-form'

export interface PropsForTriggerErrors<FormValues extends object> {
	fieldName?: keyof FormValues
}

export function TriggerErrors<FormValues extends object>({
	fieldName,
}: PropsForTriggerErrors<FormValues>) {
	const form = useForm()
	useEffect(() => {
		if (!fieldName) {
			form.submit()
			return
		}
		const stringFieldName = String(fieldName)
		form.focus(stringFieldName)
		setTimeout(() => form.blur(stringFieldName), 0)
	}, [form, fieldName])
	return null
}
