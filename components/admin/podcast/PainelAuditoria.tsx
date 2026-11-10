import Link from 'next/link'
import { History } from 'lucide-react'
import { ROTULO_ACAO, type LinhaAuditoria } from '@/lib/podcast/auditoria'

const GRUPOS = [
  { valor: '', rotulo: 'Todas as ações' },
  { valor: 'monitor', rotulo: 'Monitores' },
  { valor: 'aluno', rotulo: 'Equipe e permissões' },
  { valor: 'termo', rotulo: 'Termos e acessos' },
  { valor: 'episodio', rotulo: 'Episódios' },
  { valor: 'audio', rotulo: 'Áudios' },
  { valor: 'quadro', rotulo: 'Quadros' },
]

const COR: Record<string, string> = {
  monitor: 'bg-purple-50 text-purple-800', aluno: 'bg-blue-50 text-blue-800', termo: 'bg-amber-50 text-amber-800',
  episodio: 'bg-green-50 text-green-800', quadro: 'bg-teal-50 text-teal-800', audio: 'bg-rose-50 text-rose-800', termo_entrevistado: 'bg-amber-50 text-amber-800',
}

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

/** Registro de tudo que acontece no podcast. Filtro por pessoa e por tipo de ação (GET, sem JS). */
export default function PainelAuditoria({ linhas, pessoa, acao, maisAntigo }: { linhas: LinhaAuditoria[]; pessoa: string; acao: string; maisAntigo: string | null }) {
  return (
    <section className="panel p-6">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-5 h-5 text-escola-azul" />
        <h2 className="font-geom text-lg font-bold text-gray-900">Auditoria</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Tudo o que foi feito no podcast: quem, o quê, com quem e quando. Inclui quem baixou termo com CPF e quem abriu termo assinado. O CPF nunca aparece aqui.</p>

      <form method="get" action="/admin/podcast" className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="hidden" name="aba" value="auditoria" />
        <input name="pessoa" defaultValue={pessoa} placeholder="Nome de quem fez ou de quem foi afetado" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
        <select name="acao" defaultValue={acao} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          {GRUPOS.map(g => <option key={g.valor} value={g.valor}>{g.rotulo}</option>)}
        </select>
        <button className="inline-flex items-center justify-center bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0">Filtrar</button>
      </form>

      {linhas.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum registro{pessoa || acao ? ' com esse filtro' : ' ainda'}.</p>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-3 font-semibold">Quando</th>
                <th className="py-2 pr-3 font-semibold">Quem</th>
                <th className="py-2 pr-3 font-semibold">O quê</th>
                <th className="py-2 pr-3 font-semibold">Com quem / em quê</th>
                <th className="py-2 font-semibold">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => (
                <tr key={l.id} className="border-b border-gray-50 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-gray-500 font-mono text-xs">{quando(l.quando)}</td>
                  <td className="py-2 pr-3 text-gray-900">{l.atorNome ?? '—'}</td>
                  <td className="py-2 pr-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${COR[l.acao.split('.')[0]] ?? 'bg-gray-100 text-gray-700'}`}>{ROTULO_ACAO[l.acao] ?? l.acao}</span></td>
                  <td className="py-2 pr-3 text-gray-800">{l.alvoNome ?? '—'}</td>
                  <td className="py-2 text-gray-500 text-xs">{l.detalhe ?? ''}{l.ip ? <span className="block text-gray-400">IP {l.ip}</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {maisAntigo && (
        <Link href={`/admin/podcast?aba=auditoria&pessoa=${encodeURIComponent(pessoa)}&acao=${encodeURIComponent(acao)}&antes=${maisAntigo}`} className="inline-block mt-4 text-sm text-escola-azul hover:underline">
          Ver registros mais antigos →
        </Link>
      )}
    </section>
  )
}
