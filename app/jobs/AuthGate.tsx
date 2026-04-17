'use client'

/**

`AuthGate` — renders once auth is checked, passing `isAuthenticated` to children.

Used inside server components that need to pass auth state to client children
without doing a full client-side auth check themselves.

Usage:
```tsx
<AuthGate>
  {(isAuthenticated) => (
    <MyClientComponent isAuthenticated={isAuthenticated} />
  )}
</AuthGate>
```
*/
import { useUserAccess } from '@/lib/auth/access.client'

type AuthGateProps = {
  children: (isAuthenticated: boolean) => React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const access = useUserAccess()

  if (!access.checked) {
    // While checking auth, render nothing from the gate.
    // The parent server component still renders its non-auth-dependent parts.
    return null
  }

  return <>{children(access.isAuthenticated)}</>
}
