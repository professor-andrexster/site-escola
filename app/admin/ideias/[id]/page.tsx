import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
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
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  const { data: ideia } = await supabase
    .from('ideias')
    .select('*, autor:profiles(nome_completo, turma), trilha:trilhas(nome, icone, cor_tailwind)')
    .eq('id', id)
    .maybeSingle()
  if (!ideia) notFound()

  const [{ data: comentarios }, { data: votos }] = await Promise.all([
    supabase
      .from('ideia_comentarios')
      .select('*, autor:profiles(nome_completo, role)')
      .eq('ideia_id', id)
      .order('created_at', { ascending: true }),
    supabase.from('ideia_votos').select('ideia_id, profile_id').eq('ideia_id', id),
  ])

  const podeModerar = profile.role === 'professor' || profile.role === 'monitor' || profile.role === 'direcao'

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/ideias" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao mural
      </Link>
      <IdeiaDetail
        ideia={ideia}
        comentariosIniciais={comentarios ?? []}
        votos={votos?.length ?? 0}
        votei={(votos ?? []).some((v) => v.profile_id === user.id)}
        profileId={user.id}
        podeModerar={podeModerar}
      />
    </div>
  )
}
