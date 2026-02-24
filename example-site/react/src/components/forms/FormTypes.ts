import type {
  AnyFieldApi,
  AnyFormApi,
  ReactFormExtendedApi,
} from '@tanstack/react-form'

export type AnyExtendedFormApi = ReactFormExtendedApi<
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
>

export interface WithField<FieldApi extends AnyFieldApi> {
  field: FieldApi
}

export interface WithForm<FormApi extends AnyFormApi> {
  form: FormApi
}
export interface WithExtendedForm<FormApi extends AnyExtendedFormApi> {
  form: FormApi
}
