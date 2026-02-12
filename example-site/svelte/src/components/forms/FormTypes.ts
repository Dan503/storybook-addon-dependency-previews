import type { AnyFieldApi, AnyFormApi, SvelteFormApi } from '@tanstack/svelte-form';

export type AnyExtendedFormApi = SvelteFormApi<
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any
>;

export interface WithField<FieldApi extends AnyFieldApi> {
	field: FieldApi;
}

export interface WithForm<FormApi extends AnyFormApi> {
	form: FormApi;
}
export interface WithExtendedForm<FormApi extends AnyExtendedFormApi> {
	form: FormApi;
}
