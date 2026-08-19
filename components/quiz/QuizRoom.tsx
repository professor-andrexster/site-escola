'use client'

import QuizPlayer from './QuizPlayer'
import { usarEstadoDaSala } from '@/lib/quiz/usarEstadoDaSala'
import { Gamepad2, Users, Clock } from 'lucide-react'
import type { QuizPergunta, QuizParticipante } from '@/types/database'

interface QuizState {
  id: string
  codigo: string
  titulo: string
  turma_alvo: string
  lobby_aberto: boolean
  ativo: boolean
  encerrado: boolean
  tempo_por_pergunta: number
  quiz_iniciado_em: string | null
  pergunta_atual: number
  pergunta_liberada_em: string | null
  resposta_revelada: boolean
}

interface QuizRoomProps {
  quiz: QuizState
  participante: QuizParticipante
  perguntas: QuizPergunta[]
  jaRespondidas: Set<string>
}

export default function QuizRoom({ quiz: initialQuiz, participante, perguntas, jaRespondidas }: QuizRoomProps) {
  // O estado da sala e a lista de espera vinham por Realtime; agora vêm de uma
  // consulta a cada dois segundos, numa chamada só. O primeiro render usa o que
  // o servidor já mandou, então a tela nunca aparece vazia esperando a rede.
  const { estado: quiz, participantes } = usarEstadoDaSala(
    initialQuiz.id,
    initialQuiz,
    participante.id
  )

  // Quiz em andamento — mostra o player
  if (quiz.ativo) {
    return (
      <QuizPlayer
        perguntas={perguntas}
        participanteId={participante.id}
        quizTitulo={quiz.titulo}
        quizCodigo={quiz.codigo}
        tempoPorPergunta={quiz.tempo_por_pergunta}
        jaRespondidas={jaRespondidas}
        quizIniciadoEm={quiz.quiz_iniciado_em}
        perguntaAtual={quiz.pergunta_atual ?? 0}
        perguntaLiberadaEm={quiz.pergunta_liberada_em}
        respostaRevelada={quiz.resposta_revelada ?? false}
        encerrado={quiz.encerrado}
      />
    )
  }

  // Sala de espera (lobby)
  return (
    <div className="min-h-screen bg-gradient-to-br from-escola-marinho to-curso-azul flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Ícone animado */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-6">
          <Gamepad2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-playfair text-3xl font-black text-white mb-2">{quiz.titulo}</h1>
        <p className="text-white/50 text-sm mb-1">Turma: <span className="text-white/80 font-medium">{quiz.turma_alvo}</span></p>
        <p className="text-white/50 text-sm mb-8">{perguntas.length} pergunta{perguntas.length !== 1 ? 's' : ''}</p>

        {/* Status de espera */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            <p className="text-white font-semibold">Aguardando o professor iniciar...</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Clock className="w-4 h-4" />
            <span>{quiz.tempo_por_pergunta}s por pergunta</span>
          </div>
        </div>

        {/* Participante atual */}
        <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
          <p className="text-white/55 text-xs mb-1">Você está conectado como</p>
          <p className="text-white font-semibold">{participante.nome}</p>
          <p className="text-white/60 text-sm">{participante.turma}</p>
        </div>

        {/* Lista de participantes na sala */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Users className="w-4 h-4" />
              <span>Na sala</span>
            </div>
            <span className="text-white font-bold text-sm">{participantes.length}</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {participantes.map(p => (
              <div
                key={p.id}
                className={`flex items-center justify-between text-sm px-2 py-1 rounded-lg ${p.id === participante.id ? 'bg-white/15 text-white' : 'text-white/60'}`}
              >
                <span>{p.nome}</span>
                <span className="text-xs opacity-60">{p.turma}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
