import { CalendarDays } from 'lucide-react'
import { etapaDeHoje, periodo, type Etapa } from '@/lib/projetos-turma-tipos'

interface Props {
  cronograma: Etapa[]
  /** Etapa em que o professor marcou o aluno na ultima avaliacao (indice), se houver. */
  etapaDoAluno?: number | null
  /** Professor ve a dica de onde mudar as datas. */
  podeEditar?: boolean
  editarHref?: string
}

/**
 * Cronograma do trabalho, com o periodo de cada etapa. A semana de hoje
 * fica destacada; a etapa em que o aluno esta (pela ultima avaliacao)
 * ganha uma marca. Sem datas, a coluna Periodo fica vazia: o professor
 * preenche em Editar → Cronograma.
 */
export default function CronogramaTabela({ cronograma, etapaDoAluno = null, podeEditar = false, editarHref }: Props) {
  if (cronograma.length === 0) return null
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
  const atual = etapaDeHoje(cronograma, hoje)
  const semDatas = cronograma.every(e => !e.inicio && !e.fim)

  return (
    <section className="panel mb-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:px-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-escola-azul" /> Cronograma
        </h2>
        {podeEditar && editarHref && (
          <a href={editarHref} className="text-sm font-semibold text-escola-azul hover:underline foco-painel">
            {semDatas ? 'Marcar as datas' : 'Mudar as datas'}
          </a>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="text-left px-4 md:px-6 py-2 font-semibold">Etapa</th>
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Período</th>
              <th className="text-left px-3 py-2 font-semibold">Foco</th>
              <th className="text-left px-3 py-2 font-semibold">Você termina com</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cronograma.map((e, i) => {
              const ehHoje = i === atual
              const ehDoAluno = etapaDoAluno === i
              return (
                <tr key={i} className={ehHoje ? 'bg-blue-50/60' : ''}>
                  <td className="px-4 md:px-6 py-3 align-top">
                    <p className="font-semibold text-gray-900">{e.titulo}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ehHoje && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-escola-azul text-white">esta semana</span>}
                      {ehDoAluno && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">você está aqui</span>}
                    </div>
                    {e.aviso && <p className="text-xs text-amber-700 mt-1">{e.aviso}</p>}
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap text-gray-700">{periodo(e) || <span className="text-gray-300">a definir</span>}</td>
                  <td className="px-3 py-3 align-top text-gray-700">{e.foco}</td>
                  <td className="px-3 py-3 align-top text-gray-700">{e.entrega}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
