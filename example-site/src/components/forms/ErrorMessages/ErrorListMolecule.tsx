import { ErrorMessageAtom } from './ErrorMessageAtom'

export interface PropsForErrorListMolecule {
  errors: Array<string | Error>
}

export function ErrorListMolecule({ errors }: PropsForErrorListMolecule) {
  return (
    <ul>
      {errors.map((err) => (
        <li>
          <ErrorMessageAtom error={err} />
        </li>
      ))}
    </ul>
  )
}
