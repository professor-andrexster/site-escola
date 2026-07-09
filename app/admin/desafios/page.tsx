import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import { Plus, Rocket, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Desafios' }
export const dynamic = 'force-dynamic'

export default async function DesafiosPage() {
  const supabase = await createClient()
  const { profile } = await getProfileOrRedirect()
  const podeCriar = profile.role === 'professor' || profile.role === 'direcao'

  const query = supabase
    .from('desafios')
    .select('*, desafio_fases(id), equipes(id)')
    .order('created_at', { ascending: false })

  const { data: desafios } = podeCriar ? await query : await query.eq('publicado', true)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Desafios</h1>
          <p className="text-gray-500 text-sm mt-1">Ideias viram empresas de verdade — em fases, com equipe e nota.</p>
        </div>
        {podeCriar && (
          <Link
            href="/admin/desafios/novo"
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo Desafio
          </Link>
        )}
      </div>

      {!desafios || desafios.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Rocket className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nenhum desafio publicado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {desafios.map((d) => (
            <Link
              key={d.id}
              href={`/admin/desafios/${d.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-escola-azul transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {!d.publicado && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Rascunho</span>}
                {d.turma_alvo && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-escola-azul ml-auto">{d.turma_alvo}</span>}
              </div>
              <h2 className="font-playfair text-lg font-bold text-gray-900">{d.titulo}</h2>
              {d.subtitulo && <p className="text-sm text-gray-500 mt-0.5">{d.subtitulo}</p>}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span>{(d.desafio_fases as unknown[])?.length ?? 0} fases</span>
                <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(d.equipes as unknown[])?.length ?? 0} equipes</span>
                <span className="ml-auto font-semibold text-escola-azul">{d.pontos_total} pts</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
