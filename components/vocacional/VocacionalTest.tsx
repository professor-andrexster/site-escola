'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import { trilhaBg } from '@/lib/trilhaColors'
import { PERGUNTAS } from '@/lib/vocacional/perguntas'
import { iconeDaTrilha } from '@/lib/trilhaIcones'

const RESPOSTAS = [
  { label: 'Sim', valor: 1, classe: 'bg-green-600 hover:bg-green-500' },
  { label: 'Às vezes', valor: 0.5, classe: 'bg-yellow-500 hover:bg-yellow-400' },
  { label: 'Não', valor: 0, classe: 'bg-escola-vermelho hover:bg-escola-vermelho-escuro' },
]

type Etapa = 'matricula' | 'perguntas' | 'salvando' | 'resultado'

interface ResultadoTrilha {
  nome: string
  icone: string | null
  cor: string | null
  pontuacao: number
}

export default function VocacionalTest() {
  const [etapa, setEtapa] = useState<Etapa>('matricula')
  const [matricula, setMatricula] = useState('')
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [nomeAluno, setNomeAluno] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<{ pergunta_id: number; resposta: number }[]>([])
  const [resultado, setResultado] = useState<ResultadoTrilha[]>([])

  async function buscarAluno() {
    if (!matricula.trim()) {
      setErro('Informe sua matrícula.')
      return
    }
    setLoading(true)
    setErro('')

    const res = await fetch('/api/vocacional/aluno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula: matricula.trim() }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErro(json.error ?? 'Matrícula não encontrada. Verifique com a coordenação.')
      setLoading(false)
      return
    }

    setAlunoId(json.id)
    setNomeAluno(json.nome)
    setLoading(false)
    setEtapa('perguntas')
  }

  async function responder(valor: number) {
    const pergunta = PERGUNTAS[perguntaAtual]
    const novasRespostas = [...respostas, { pergunta_id: pergunta.id, resposta: valor }]
    setRespostas(novasRespostas)

    if (perguntaAtual + 1 < PERGUNTAS.length) {
      setPerguntaAtual(perguntaAtual + 1)
    } else {
      await finalizar(novasRespostas)
    }
  }

  async function finalizar(respostasFinais: { pergunta_id: number; resposta: number }[]) {
    setEtapa('salvando')

    // A apuração é do servidor: ele recalcula a pontuação a partir dos mesmos
    // pesos e devolve o resultado já ordenado. Antes a conta era feita aqui e
    // o número ia pronto para perfis_vocacionais.
    const res = await fetch('/api/vocacional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId, respostas: respostasFinais }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao salvar o resultado.')
      setEtapa('perguntas')
      return
    }

    setResultado(json.resultado as ResultadoTrilha[])
    setEtapa('resultado')
  }

  const progresso = Math.round((perguntaAtual / PERGUNTAS.length) * 100)

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo / título */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-escola-vermelho mb-3 rounded-full">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Teste Vocacional</h1>
          <p className="text-white/55 text-sm font-mono mt-1">EMTI · Trilhas de Tecnologia</p>
        </div>

        {/* Etapa: matrícula */}
        {etapa === 'matricula' && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              Digite sua matrícula para começar. Ao final, você vai descobrir quais trilhas de tecnologia
              combinam mais com você.
            </p>
            <input
              type="text"
              value={matricula}
              onChange={(e) => { setMatricula(e.target.value.toUpperCase()); setErro('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') buscarAluno() }}
              placeholder="Sua matrícula"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-escola-vermelho/40 mb-3"
            />
            {erro && <p className="text-escola-vermelho text-xs mb-3">{erro}</p>}
            <div
              role="button"
              tabIndex={0}
              onClick={() => !loading && buscarAluno()}
              onKeyDown={(e) => { if (e.key === 'Enter' && !loading) buscarAluno() }}
              className={`flex items-center justify-center gap-2 bg-escola-vermelho text-white font-semibold text-sm py-3 rounded-lg cursor-pointer hover:bg-escola-vermelho-escuro transition-colors ${loading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {loading ? 'Verificando...' : 'Começar'}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Etapa: perguntas */}
        {etapa === 'perguntas' && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            {/* Barra de progresso */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progresso}%` }} />
            </div>
            <p className="text-white/55 text-xs font-mono mb-4">
              Pergunta {perguntaAtual + 1} de {PERGUNTAS.length}
            </p>
            <p className="text-white font-playfair text-lg font-bold mb-6 leading-snug">
              {PERGUNTAS[perguntaAtual].texto}
            </p>
            <div className="space-y-2">
              {RESPOSTAS.map(r => (
                <div
                  key={r.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => responder(r.valor)}
                  onKeyDown={(e) => { if (e.key === 'Enter') responder(r.valor) }}
                  className={`text-center text-white font-semibold text-sm py-3 rounded-lg cursor-pointer transition-colors ${r.classe}`}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Etapa: salvando */}
        {etapa === 'salvando' && (
          <div className="bg-gray-900 rounded-2xl p-10 border border-white/5 text-center">
            <p className="text-white/60 text-sm">Calculando seu perfil...</p>
          </div>
        )}

        {/* Etapa: resultado */}
        {etapa === 'resultado' && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            <div className="text-center mb-5">
              <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-white/70 text-sm">
                {nomeAluno ? `Valeu, ${nomeAluno.split(' ')[0]}!` : 'Resultado pronto!'} Suas trilhas com mais afinidade são:
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {resultado.slice(0, 3).map((t, i) => (
                <div key={t.nome} className="flex items-center gap-3 bg-gray-800 rounded-xl p-4 border border-white/5">
                  <IconeTrilha trilha={t} />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{i + 1}º · {t.nome}</p>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full ${trilhaBg(t.cor)}`} style={{ width: `${t.pontuacao}%` }} />
                    </div>
                  </div>
                  <span className="text-white/55 text-xs font-mono">{t.pontuacao}%</span>
                </div>
              ))}
            </div>
            {alunoId && (
              <Link
                href={`/portfolio/${matricula.trim()}`}
                className="flex items-center justify-center gap-2 bg-escola-vermelho text-white font-semibold text-sm py-3 rounded-lg hover:bg-escola-vermelho-escuro transition-colors"
              >
                Ver meu portfólio <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** O ícone da trilha em traço — antes era o emoji que vinha do banco. */
function IconeTrilha({ trilha }: { trilha: { nome: string } }) {
  const Icone = iconeDaTrilha(trilha)
  return <Icone className="w-6 h-6 text-white/70 flex-shrink-0" strokeWidth={1.5} aria-hidden />
}
