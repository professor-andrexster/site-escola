'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, ChevronRight, RotateCcw, ScrollText } from 'lucide-react'

interface PerguntaProva {
  id: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
}

interface Resultado {
  aprovado: boolean
  nota: number
  acertos?: number
  total?: number
  notaMinima?: number
  codigo?: string
}

const LETRAS = ['a', 'b', 'c', 'd'] as const

export default function ProvaFinal({ cursoId, totalPerguntas }: { cursoId: string; totalPerguntas: number }) {
  const [fase, setFase] = useState<'intro' | 'prova' | 'resultado'>('intro')
  const [perguntas, setPerguntas] = useState<PerguntaProva[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function comecar() {
    setLoading(true)
    setErro('')
    const res = await fetch(`/api/cursos/prova?cursoId=${cursoId}`)
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao carregar a prova.')
      setLoading(false)
      return
    }
    setPerguntas(json.perguntas)
    setRespostas({})
    setFase('prova')
    setLoading(false)
  }

  async function enviar() {
    if (perguntas.some(p => !respostas[p.id])) {
      setErro('Responda todas as questões antes de enviar.')
      return
    }
    setLoading(true)
    setErro('')
    const res = await fetch('/api/cursos/prova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursoId, respostas }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao corrigir a prova.')
      setLoading(false)
      return
    }
    setResultado(json)
    setFase('resultado')
    setLoading(false)
    if (json.aprovado) router.refresh()
  }

  const respondidas = perguntas.filter(p => respostas[p.id]).length

  if (fase === 'intro') {
    return (
      <div className="bg-white/5 border border-curso-ciano/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-curso-ciano/15 flex items-center justify-center flex-shrink-0">
            <ScrollText className="w-5 h-5 text-curso-ciano" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold font-geom text-lg mb-1">Prova final liberada</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Você concluiu todas as aulas. A prova tem {totalPerguntas} {totalPerguntas === 1 ? 'questão' : 'questões'} de
              múltipla escolha e precisa de 70% de acerto. Passou, o certificado sai na hora, com seu nome e a carga
              horária do curso. Não passou, revisa e tenta de novo quantas vezes quiser.
            </p>
            {erro && <p className="text-red-400 text-sm mb-3">{erro}</p>}
            <button
              onClick={comecar}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-curso-ciano text-curso-tinta px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Fazer a Prova'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'resultado' && resultado) {
    if (resultado.aprovado) {
      return (
        <div className="bg-white/5 border border-green-400/30 rounded-2xl p-6 text-center">
          <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-black font-geom text-xl mb-1">Aprovado! Nota {resultado.nota}</h3>
          <p className="text-white/60 text-sm mb-5">Seu certificado foi emitido. Ele é seu: imprima ou compartilhe o link.</p>
          <Link
            href={`/certificado/${resultado.codigo}`}
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
          >
            <Award className="w-4 h-4" />
            Ver Meu Certificado
          </Link>
        </div>
      )
    }
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-white font-bold font-geom text-lg mb-1">
          Nota {resultado.nota} · {resultado.acertos} de {resultado.total} questões
        </h3>
        <p className="text-white/60 text-sm mb-5">
          Faltou pouco: a prova pede {resultado.notaMinima ?? 70}%. Revise as aulas e tente de novo, sem limite de tentativas.
        </p>
        <button
          onClick={comecar}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold font-geom text-lg">Prova final</h3>
        <span className="text-white/40 text-xs font-jetbrains">{respondidas}/{perguntas.length} respondidas</span>
      </div>

      <div className="space-y-6">
        {perguntas.map((p, i) => (
          <fieldset key={p.id}>
            <legend className="text-white/90 text-sm font-semibold leading-relaxed mb-3">
              {i + 1}. {p.enunciado}
            </legend>
            <div className="space-y-2">
              {LETRAS.map(letra => {
                const texto = p[`alternativa_${letra}`]
                const marcada = respostas[p.id] === letra
                return (
                  <label
                    key={letra}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      marcada ? 'border-curso-ciano bg-curso-ciano/10' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name={p.id}
                      value={letra}
                      checked={marcada}
                      onChange={() => setRespostas(prev => ({ ...prev, [p.id]: letra }))}
                      className="mt-0.5 accent-curso-ciano"
                    />
                    <span className="text-white/75 text-sm leading-relaxed">
                      <strong className="uppercase me-1.5 font-jetbrains text-xs">{letra})</strong>
                      {texto}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {erro && <p className="text-red-400 text-sm mt-4">{erro}</p>}

      <button
        onClick={enviar}
        disabled={loading}
        className="mt-6 w-full bg-curso-ciano text-curso-tinta py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Corrigindo...' : 'Enviar Respostas'}
      </button>
    </div>
  )
}
