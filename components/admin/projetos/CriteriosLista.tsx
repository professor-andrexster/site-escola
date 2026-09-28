import { CheckCircle2, Circle, CircleDot, ClipboardCheck } from 'lucide-react'
import { ROTULO_MARCA, type Criterio, type Marcas } from '@/lib/projetos-turma-tipos'

interface Props {
  criterios: Criterio[]
  /** Marcas da ultima avaliacao do aluno; sem elas, a lista e so o enunciado. */
  marcas?: Marcas | null
}

/**
 * Criterios de avaliacao do trabalho. Para o aluno avaliado, cada criterio
 * mostra a marca do professor (OK / Parcial / Falta): e a lista do que
 * ainda precisa fazer.
 */
export default function CriteriosLista({ criterios, marcas = null }: Props) {
  if (criterios.length === 0) return null
  const totalPeso = criterios.reduce((s, c) => s + c.peso, 0)
  const pesosIguais = criterios.every(c => c.peso === criterios[0].peso)

  return (
    <section className="panel p-4 md:p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2 mb-3">
        <ClipboardCheck className="w-5 h-5 text-escola-azul" /> Como você vai ser avaliado
      </h2>
      <ul className="divide-y divide-gray-100">
        {criterios.map((c, i) => {
          const m = marcas?.[String(i)]
          const Icone = m === 2 ? CheckCircle2 : m === 1 ? CircleDot : Circle
          const cor = m === 2 ? 'text-green-600' : m === 1 ? 'text-amber-500' : m === 0 ? 'text-red-500' : 'text-gray-300'
          return (
            <li key={i} className="flex items-start gap-3 py-2.5">
              <Icone className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cor}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {c.titulo}
                  {!pesosIguais && <span className="text-gray-400 font-normal"> · peso {c.peso}{totalPeso ? ` de ${totalPeso}` : ''}</span>}
                </p>
                {c.descricao && <p className="text-sm text-gray-600">{c.descricao}</p>}
              </div>
              {m !== undefined && (
                <span className={`text-xs font-semibold flex-shrink-0 ${cor}`}>{ROTULO_MARCA[m]}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
