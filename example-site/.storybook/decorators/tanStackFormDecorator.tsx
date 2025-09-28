// .storybook/withTanStackForm.tsx
import type { Decorator } from '@storybook/react-vite'
import { useAppForm } from '../../src/hooks/demo.form' //'/example-site/src/hooks/demo.form.ts'
import { formContext } from '../../src/hooks/demo.form-context'

// Create a decorator factory so you can pick the field name per story
export const tanStackFormDecorator =
  (fieldName = 'value'): Decorator =>
  (Story) => {
    type Values = Record<string, string>
    const form = useAppForm({})

    return (
      <div style={{ maxWidth: 420 }}>
        <formContext.Provider value={form}>
          <form.Field
            // `as any` keeps TS happy since name must be a key of Values
            name={fieldName as keyof Values}
            validators={{
              onBlur: ({ value }) => (!value ? 'Required' : undefined),
            }}
          >
            {() => <Story />}
          </form.Field>

          <form.Subscribe selector={(s) => s.values}>
            {(values) => (
              <pre style={{ marginTop: 16 }}>
                {JSON.stringify(values, null, 2)}
              </pre>
            )}
          </form.Subscribe>
        </formContext.Provider>
      </div>
    )
  }
