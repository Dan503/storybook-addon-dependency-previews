export interface PropsForErrorMessageAtom {
  error: string | Error
}

export function ErrorMessageAtom({ error }: PropsForErrorMessageAtom) {
  return (
    <p
      key={typeof error === 'string' ? error : error.message}
      className="text-red-500 mt-1 font-bold"
    >
      {typeof error === 'string' ? error : error.message}
    </p>
  )
}
