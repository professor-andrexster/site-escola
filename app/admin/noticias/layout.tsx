import { redirect } from 'next/navigation'

export default async function NoticiasLayout() {
  redirect('/admin/dashboard')
}
