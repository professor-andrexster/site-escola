import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, Library } from 'lucide-react'
import ObrasTable, { type ObraLinha } from '@/components/admin/biblioteca/ObrasTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Acervo, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function AcervoPage() {
  const admin = createAdminClient()

  const [{ data: obras }, { data: categorias }, { data: vinculos }, { data: exemplares }] = await Promise.all([
    admin.from('biblioteca_obras').select('*').eq('situacao', 'ativa').order('titulo'),
    admin.from('biblioteca_categorias').select('id, nome').eq('ativo', true).order('nome'),
    admin.from('biblioteca_obras_autores').select('obra_id, biblioteca_autores(id, nome)'),
    admin.from('biblioteca_exemplares').select('id, obra_id, situacao'),
  ])

  const categoriaPorId = new Map((categorias ?? []).map(c => [c.id, c.nome]))

  const autoresPorObra = new Map<string, string[]>()
  for (const v of vinculos ?? []) {
    const autor = Array.isArray(v.biblioteca_autores) ? v.biblioteca_autores[0] : v.biblioteca_autores
    if (!autor) continue
    const lista = autoresPorObra.get(v.obra_id) ?? []
    lista.push(autor.nome)
    autoresPorObra.set(v.obra_id, lista)
  }

  const exemplaresPorObra = new Map<string, { total: number; disponiveis: number }>()
  for (const e of exemplares ?? []) {
    const atual = exemplaresPorObra.get(e.obra_id) ?? { total: 0, disponiveis: 0 }
    atual.total++
    if (e.situacao === 'disponivel') atual.disponiveis++
    exemplaresPorObra.set(e.obra_id, atual)
  }

  const linhas: ObraLinha[] = (obras ?? []).map(o => ({
    ...o,
    autores: autoresPorObra.get(o.id) ?? [],
    categoriaNome: o.categoria_id ? categoriaPorId.get(o.categoria_id) ?? null : null,
    totalExemplares: exemplaresPorObra.get(o.id)?.total ?? 0,
    exemplaresDisponiveis: exemplaresPorObra.get(o.id)?.disponiveis ?? 0,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Library className="w-6 h-6 text-escola-azul" />
            Acervo
          </h1>
          <p className="text-sm text-gray-400 mt-1">{linhas.length} obra(s) cadastrada(s).</p>
        </div>
        <Link
          href="/admin/biblioteca/acervo/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-escola-azul text-white rounded-xl text-sm font-semibold hover:bg-escola-azul/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Obra
        </Link>
      </div>

      <ObrasTable obras={linhas} categorias={categorias ?? []} />
    </div>
  )
}
