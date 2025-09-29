import type { AnyFormApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { FormDataPreviewAtom } from './FormDataPreviewAtom'
import type { WithForm } from '../FormTypes'

interface PropsForFormDataWrapper<FormApi extends AnyFormApi>
  extends WithForm<FormApi> {
  children: ReactNode
}

export function FormDataMolecule<FormApi extends AnyFormApi>({
  form,
  children,
}: PropsForFormDataWrapper<FormApi>) {
  return (
    <div className="grid gap-2">
      {children}
      <FormDataPreviewAtom form={form} />
    </div>
  )
}
