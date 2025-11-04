import type { ReactNode } from 'react'

export interface PropsForFooterOrganism {
  children?: ReactNode
}

export function FooterOrganism({ children }: PropsForFooterOrganism) {
  return (
    <div className="FooterOrganism">
      <p>FooterOrganism</p>
      {children}
    </div>
  )
}
