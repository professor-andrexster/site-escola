import DevolucaoConsole from '@/components/admin/biblioteca/DevolucaoConsole'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Devolução, Biblioteca' }
export const dynamic = 'force-dynamic'

export default function DevolucaoPage() {
  return <DevolucaoConsole />
}
