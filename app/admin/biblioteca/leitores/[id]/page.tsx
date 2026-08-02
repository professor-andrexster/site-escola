import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, History } from 'lucide-react'
import LeitorForm from '@/components/admin/biblioteca/LeitorForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar Leitor, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function LeitorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: leitor } = await admin.from('biblioteca_leitores').select('*').eq('id', id).maybeSingle()
  if (!leitor) notFound()

  const { data: emprestimos } = await admin
    .from('biblioteca_emprestimos')
    .select('*, biblioteca_exemplares(tombo, biblioteca_obras(titulo))')
    .eq('leitor_id', id)
    .order('data_emprestimo', { ascending: false })

  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/leitores" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para leitores
      </Link>
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-6">{leitor.nome_completo}</h1>

      <div className="panel p-5 mb-6">
        <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-escola-azul" />
          Histórico de Empréstimos
        </h2>
        {!emprestimos || emprestimos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum empréstimo registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {emprestimos.map(e => {
              const exemplar = Array.isArray(e.biblioteca_exemplares) ? e.biblioteca_exemplares[0] : e.biblioteca_exemplares
              const obra = exemplar && (Array.isArray(exemplar.biblioteca_obras) ? exemplar.biblioteca_obras[0] : exemplar.biblioteca_obras)
              return (
                <div key={e.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 py-2">
                  <span className="text-gray-700">{obra?.titulo ?? 'Obra'}</span>
                  <span className="text-xs text-gray-400">{e.situacao}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <LeitorForm leitor={leitor} />
    </div>
  )
}
