import { acervoCompleto } from '@/lib/db/biblioteca'
import Link from 'next/link'
import { Plus, Library } from 'lucide-react'
import ObrasTable, { type ObraLinha } from '@/components/admin/biblioteca/ObrasTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Acervo, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function AcervoPage() {
  // Quatro consultas e tres Maps viraram uma: a antiga trazia TODOS os
  // exemplares do acervo so para conta-los por obra.
  const { obras, categorias } = await acervoCompleto()
  const categoriaPorId = new Map(categorias.map(c => [c.id, c.nome]))

  const linhas: ObraLinha[] = obras.map(o => ({
    ...o,
    autores: o.autores.map(a => a.nome),
    categoriaNome: o.categoria_id ? categoriaPorId.get(o.categoria_id) ?? null : null,
    totalExemplares: o.totalExemplares,
    exemplaresDisponiveis: o.disponiveis,
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
