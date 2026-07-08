import { getProfileOrRedirect } from '@/lib/profile'

export default async function AulaPlayerLayout({ children }: { children: React.ReactNode }) {
  await getProfileOrRedirect()
  return <>{children}</>
}
