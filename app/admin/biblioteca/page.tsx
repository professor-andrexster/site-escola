import { createAdminClient } from '@/lib/supabase/admin'
import { calcularDiasAtraso } from '@/lib/biblioteca/emprestimos'
import Link from 'next/link'
import {
  Library, BookOpen, Users, ScanLine, RotateCcw, Plus, UserPlus,
  AlertTriangle, Trophy, CalendarClock, Search,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Biblioteca, Painel' }
export const dynamic = 'force-dynamic'

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default async function BibliotecaPainelPage() {
  const admin = createAdminClient()

  const [
    { count: totalObras },
    { count: totalExemplares },
    { count: leitoresAtivos },
    { count: emprestimosAndamento },
  ] = await Promise.all([
    admin.from('biblioteca_obras').select('id', { count: 'exact', head: true }).eq('situacao', 'ativa'),
    admin.from('biblioteca_exemplares').select('id', { count: 'exact', head: true }),
    admin.from('biblioteca_leitores').select('id', { count: 'exact', head: true }).eq('situacao', 'ativo'),
    admin.from('biblioteca_emprestimos').select('id', { count: 'exact', head: true }).in('situacao', ['em_andamento', 'renovado']),
  ])

  const semAcervo = (totalObras ?? 0) === 0 && (totalExemplares ?? 0) === 0

  const hoje = new Date()
  const hojeIso = hoje.toISOString().slice(0, 10)
  const proximosSeteDias = new Date(hoje)
  proximosSeteDias.setDate(proximosSeteDias.getDate() + 7)

  const { data: emprestimosAbertos } = await admin
    .from('biblioteca_emprestimos')
    .select('id, exemplar_id, data_prevista, biblioteca_exemplares(tombo, biblioteca_obras(titulo)), biblioteca_leitores(nome_completo, turma)')
    .in('situacao', ['em_andamento', 'renovado'])
    .order('data_prevista')

  const atrasados = (emprestimosAbertos ?? [])
    .filter(e => e.data_prevista < hojeIso)
    .map(e => ({ ...e, diasAtraso: calcularDiasAtraso(e.data_prevista, hoje) }))

  const devolucoesProximas = (emprestimosAbertos ?? []).filter(
    e => e.data_prevista >= hojeIso && e.data_prevista <= proximosSeteDias.toISOString().slice(0, 10)
  )

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const { data: emprestimosDoMes } = await admin
    .from('biblioteca_emprestimos')
    .select('leitor_id, biblioteca_leitores(nome_completo, turma)')
    .gte('data_emprestimo', inicioMes)

  const contagemPorLeitor = new Map<string, { nome: string; turma: string | null; total: number }>()
  for (const e of emprestimosDoMes ?? []) {
    const leitor = Array.isArray(e.biblioteca_leitores) ? e.biblioteca_leitores[0] : e.biblioteca_leitores
    if (!leitor) continue
    const atual = contagemPorLeitor.get(e.leitor_id) ?? { nome: leitor.nome_completo, turma: leitor.turma, total: 0 }
    atual.total++
    contagemPorLeitor.set(e.leitor_id, atual)
  }
  const assiduos = Array.from(contagemPorLeitor.values()).sort((a, b) => b.total - a.total).slice(0, 5)

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Library className="w-7 h-7 text-escola-azul" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
          <p className="text-sm text-gray-400">Situação de hoje, {hoje.toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {semAcervo ? (
        <div className="empty-state p-10 mb-8">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">O acervo ainda está vazio.</p>
          <p className="text-gray-400 text-sm mb-4">Comece cadastrando uma obra e seus exemplares.</p>
          <Link href="/admin/biblioteca/acervo/novo" className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-escola-azul/90 transition-colors">
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Obra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Obras" value={totalObras ?? 0} icon={BookOpen} color="bg-blue-50 text-blue-600" />
          <StatCard label="Exemplares" value={totalExemplares ?? 0} icon={Library} color="bg-purple-50 text-purple-600" />
          <StatCard label="Leitores Ativos" value={leitoresAtivos ?? 0} icon={Users} color="bg-green-50 text-green-600" />
          <StatCard label="Empréstimos Abertos" value={emprestimosAndamento ?? 0} icon={ScanLine} color="bg-orange-50 text-orange-600" />
        </div>
      )}

      {/* Atalhos */}
      <div className="panel p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link href="/admin/biblioteca/acervo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <Search className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Consultar</span>
          </Link>
          <Link href="/admin/biblioteca/emprestimo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <ScanLine className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Emprestar</span>
          </Link>
          <Link href="/admin/biblioteca/devolucao" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <RotateCcw className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Devolver</span>
          </Link>
          <Link href="/admin/biblioteca/acervo/novo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Cadastrar Livro</span>
          </Link>
          <Link href="/admin/biblioteca/leitores/novo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Cadastrar Leitor</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atrasos */}
        <div className="panel p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-escola-vermelho" />
            Atrasos
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {atrasados.length === 0 ? 'Nenhum atraso no momento.' : `${atrasados.length} exemplar(es) atrasado(s), os mais antigos primeiro.`}
          </p>
          {atrasados.length > 0 && (
            <div className="space-y-2">
              {atrasados.slice(0, 5).map(e => {
                const exemplar = Array.isArray(e.biblioteca_exemplares) ? e.biblioteca_exemplares[0] : e.biblioteca_exemplares
                const obra = exemplar && (Array.isArray(exemplar.biblioteca_obras) ? exemplar.biblioteca_obras[0] : exemplar.biblioteca_obras)
                const leitor = Array.isArray(e.biblioteca_leitores) ? e.biblioteca_leitores[0] : e.biblioteca_leitores
                return (
                  <Link
                    key={e.id}
                    href="/admin/biblioteca/devolucao"
                    className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 hover:border-red-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{leitor?.nome_completo}</p>
                      <p className="text-xs text-gray-500 truncate">{leitor?.turma ? `Turma ${leitor.turma} · ` : ''}{obra?.titulo}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 flex-shrink-0 ml-2">{e.diasAtraso}d</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Leitores assiduos */}
        <div className="panel p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Leitores Mais Assíduos do Mês
          </h2>
          <p className="text-xs text-gray-400 mb-4">{assiduos.length === 0 ? 'Nenhum empréstimo este mês ainda.' : 'Quem mais pegou livro emprestado.'}</p>
          {assiduos.length > 0 && (
            <div className="space-y-2">
              {assiduos.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.nome}</p>
                    {a.turma && <p className="text-xs text-gray-400">Turma {a.turma}</p>}
                  </div>
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0">{a.total} livro(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devolucoes previstas */}
        <div className="panel p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-escola-azul" />
            Devoluções Previstas (Próximos 7 Dias)
          </h2>
          <p className="text-xs text-gray-400 mb-4">{devolucoesProximas.length === 0 ? 'Nada previsto para os próximos dias.' : `${devolucoesProximas.length} devolução(ões) prevista(s).`}</p>
          {devolucoesProximas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {devolucoesProximas.map(e => {
                const exemplar = Array.isArray(e.biblioteca_exemplares) ? e.biblioteca_exemplares[0] : e.biblioteca_exemplares
                const obra = exemplar && (Array.isArray(exemplar.biblioteca_obras) ? exemplar.biblioteca_obras[0] : exemplar.biblioteca_obras)
                const leitor = Array.isArray(e.biblioteca_leitores) ? e.biblioteca_leitores[0] : e.biblioteca_leitores
                return (
                  <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{leitor?.nome_completo}</p>
                      <p className="text-xs text-gray-400 truncate">{obra?.titulo}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(e.data_prevista + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
