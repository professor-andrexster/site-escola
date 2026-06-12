'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import type { Trilha } from '@/types/database'
import { trilhaBg } from '@/lib/trilhaColors'

interface Pergunta {
  id: number
  texto: string
  pesos: Record<string, number>
}

const PERGUNTAS: Pergunta[] = [
  { id: 1, texto: 'Você gosta de organizar dados em tabelas e encontrar padrões?', pesos: { 'Excel & Dados': 3, 'Programação': 1 } },
  { id: 2, texto: 'Prefere trabalhar com peças físicas, montar e desmontar equipamentos?', pesos: { 'Hardware': 3, 'Software': 1 } },
  { id: 3, texto: 'Gosta de criar layouts, escolher cores e fazer coisas bonitas visualmente?', pesos: { 'Design Digital': 3 } },
  { id: 4, texto: 'Fica curioso quando um programa trava — quer entender o porquê?', pesos: { 'Software': 3, 'Programação': 2 } },
  { id: 5, texto: 'Já tentou criar um site, app ou script por conta própria?', pesos: { 'Programação': 3 } },
  { id: 6, texto: 'Consegue explicar para outras pessoas como usar um computador?', pesos: { 'Software': 2, 'Hardware': 1 } },
  { id: 7, texto: 'Usa planilhas para controlar gastos, notas ou qualquer coisa pessoal?', pesos: { 'Excel & Dados': 3 } },
  { id: 8, texto: 'Já editou uma foto, vídeo ou fez um cartaz digital?', pesos: { 'Design Digital': 3, 'Software': 1 } },
  { id: 9, texto: 'Se um computador der problema, você tenta resolver antes de pedir ajuda?', pesos: { 'Hardware': 2, 'Software': 2 } },
  { id: 10, texto: 'Tem interesse em entender como a internet funciona por dentro?', pesos: { 'Programação': 2, 'Hardware': 2, 'Software': 1 } },
  { id: 11, texto: 'Gosta de seguir instruções passo a passo com precisão?', pesos: { 'Excel & Dados': 2, 'Software': 2 } },
  { id: 12, texto: 'Prefere criar algo do zero a consertar algo existente?', pesos: { 'Programação': 2, 'Design Digital': 2 } },
  { id: 13, texto: 'Trabalha bem com números e lógica matemática?', pesos: { 'Programação': 2, 'Excel & Dados': 2 } },
  { id: 14, texto: 'Você se importa com a aparência e usabilidade dos aplicativos que usa?', pesos: { 'Design Digital': 3, 'Programação': 1 } },
  { id: 15, texto: 'Quer trabalhar consertando computadores de empresas ou pessoas?', pesos: { 'Hardware': 3, 'Software': 2 } },
]

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

  const supabase = createClient()

  async function buscarAluno() {
    if (!matricula.trim()) {
      setErro('Informe sua matrícula.')
      return
    }
    setLoading(true)
    setErro('')

    const { data, error } = await supabase
      .from('alunos')
      .select('id, nome')
      .eq('matricula', matricula.trim())
      .maybeSingle()

    if (error || !data) {
      setErro('Matrícula não encontrada. Verifique com a coordenação.')
      setLoading(false)
      return
    }

    setAlunoId(data.id)
    setNomeAluno(data.nome)
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

    // Soma pontuação por trilha e pontuação máxima possível
    const soma: Record<string, number> = {}
    const maximo: Record<string, number> = {}

    PERGUNTAS.forEach((pergunta, i) => {
      const valor = respostasFinais[i].resposta
      Object.entries(pergunta.pesos).forEach(([trilha, peso]) => {
        soma[trilha] = (soma[trilha] ?? 0) + peso * valor
        maximo[trilha] = (maximo[trilha] ?? 0) + peso
      })
    })

    const { data: trilhas } = await supabase.from('trilhas').select('*')
    const trilhasData = (trilhas ?? []) as Trilha[]

    const pontuacoes: ResultadoTrilha[] = trilhasData.map(t => ({
      nome: t.nome,
      icone: t.icone,
      cor: t.cor_tailwind,
      pontuacao: maximo[t.nome] ? Math.round((soma[t.nome] / maximo[t.nome]) * 100) : 0,
    }))

    pontuacoes.sort((a, b) => b.pontuacao - a.pontuacao)
    setResultado(pontuacoes)

    if (alunoId) {
      await supabase.from('testes_vocacionais').insert({
        aluno_id: alunoId,
        respostas: respostasFinais,
      })

      for (const trilha of trilhasData) {
        const pontuacao = maximo[trilha.nome] ? Math.round((soma[trilha.nome] / maximo[trilha.nome]) * 100) : 0
        await supabase.from('perfis_vocacionais').upsert({
          aluno_id: alunoId,
          trilha_id: trilha.id,
          pontuacao,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'aluno_id,trilha_id' })
      }
    }

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
          <p className="text-white/40 text-sm font-mono mt-1">EMTI · Trilhas de Tecnologia</p>
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
              onChange={(e) => { setMatricula(e.target.value); setErro('') }}
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
            <p className="text-white/40 text-xs font-mono mb-4">
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
                  <div className="text-2xl">{t.icone}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{i + 1}º · {t.nome}</p>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full ${trilhaBg(t.cor)}`} style={{ width: `${t.pontuacao}%` }} />
                    </div>
                  </div>
                  <span className="text-white/40 text-xs font-mono">{t.pontuacao}%</span>
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
