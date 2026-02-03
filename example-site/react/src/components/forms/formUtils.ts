import { useStore, type AnyFormApi } from '@tanstack/react-form'

export function useFormValues<FormApi extends AnyFormApi>(
	form: FormApi,
): FormApi['state']['values'] {
	return useStore(form.store, (state) => state.values)
}
