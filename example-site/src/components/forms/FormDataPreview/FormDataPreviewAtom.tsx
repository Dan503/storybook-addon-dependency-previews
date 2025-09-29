import type { AnyFormApi } from '@tanstack/react-form'
import type { WithForm } from '../FormTypes'

export function FormDataPreviewAtom<FormApi extends AnyFormApi>({
  form,
}: WithForm<FormApi>) {
  return (
    <pre>
      <code>{JSON.stringify(form.store.state.values, null, 3)}</code>
    </pre>
  )
}
