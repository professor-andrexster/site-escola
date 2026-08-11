import { fichaDaIdeia } from '@/lib/db/comunidade'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import IdeiaDetail from '@/components/admin/IdeiaDetail'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Ideia' }
export const dynamic = 'force-dynamic'

export default async function IdeiaPage({ params }: Props) {
  const { id } = await params
  const { user, profile } = await getProfileOrRedirect()

  const ficha = await fichaDaIdeia(id)
  if (!ficha) notFound()
  const { ideia, comentarios, votos } = ficha

  const podeModerar = profile.role === 'professor' || profile.role === 'monitor' || isGestao(profile.role)

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/ideias" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao mural
      </Link>
      <IdeiaDetail
        ideia={ideia}
        comentariosIniciais={comentarios}
        votos={votos.length}
        votei={votos.some(v => v.profile_id === user.id)}
        podeModerar={podeModerar}
      />
    </div>
  )
}
