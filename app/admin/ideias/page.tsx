import { quadroDeIdeias } from '@/lib/db/comunidade'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import IdeiasBoard from '@/components/admin/IdeiasBoard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Fábrica de Ideias' }
export const dynamic = 'force-dynamic'

export default async function IdeiasPage() {
  const { user, profile } = await getProfileOrRedirect()

  const { ideias, votos, trilhas } = await quadroDeIdeias()

  const votosPorIdeia = new Map<string, number>()
  const minhasVotadas = new Set<string>()
  for (const v of votos ?? []) {
    votosPorIdeia.set(v.ideia_id, (votosPorIdeia.get(v.ideia_id) ?? 0) + 1)
    if (v.profile_id === user.id) minhasVotadas.add(v.ideia_id)
  }

  const ideiasComVotos = (ideias ?? []).map((i) => ({
    ...i,
    votos: votosPorIdeia.get(i.id) ?? 0,
    votei: minhasVotadas.has(i.id),
  }))

  const podeModerar = profile.role === 'professor' || profile.role === 'monitor' || isGestao(profile.role)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fábrica de Ideias</h1>
        <p className="text-gray-500 text-sm mt-1">Toda ideia começa aqui: uma dor real, uma lacuna, um jeito diferente de resolver.</p>
      </div>
      <IdeiasBoard
        ideiasIniciais={ideiasComVotos}
        trilhas={trilhas ?? []}
        podeModerar={podeModerar}
      />
    </div>
  )
}
