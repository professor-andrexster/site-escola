'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Acompanha o estado de uma sala de quiz.
 *
 * Substitui a subscricao Realtime do Supabase por consulta periodica. Ver a
 * rota GET /api/quiz/[id]/estado para o porque de nao ser WebSocket.
 *
 * Dois detalhes que a versao ingenua erra:
 *
 * - a consulta seguinte so parte quando a anterior volta. Com `setInterval`,
 *   uma resposta lenta empilha requisicoes e a sala vira uma fila;
 * - a aba em segundo plano nao consulta. O navegador ja estrangula timer de
 *   aba escondida, e aluno com o celular no bolso nao precisa de estado
 *   nenhum — quando ele volta, a primeira consulta ja traz o atual.
 */
export type EstadoDaSala = {
  lobby_aberto: boolean
  ativo: boolean
  encerrado: boolean
  quiz_iniciado_em: string | null
  pergunta_atual: number
  pergunta_liberada_em: string | null
  resposta_revelada: boolean
  tempo_por_pergunta: number
  resposta_certa_atual?: string | null
  /** Pontos do aluno nas perguntas já reveladas, somados no servidor. */
  meus_pontos?: number
}

export type ParticipanteDaSala = { id: string; nome: string; turma: string }

const INTERVALO_MS = 2000

export function usarEstadoDaSala<T extends EstadoDaSala>(
  quizId: string,
  inicial: T,
  participanteId?: string
) {
  const [estado, setEstado] = useState<T>(inicial)
  const [participantes, setParticipantes] = useState<ParticipanteDaSala[]>([])
  const vivo = useRef(true)
  // Diferença entre a hora do servidor e a deste aparelho.
  const deslocamento = useRef(0)
  const [sincronizado, setSincronizado] = useState(false)
  const agora = useCallback(() => Date.now() + deslocamento.current, [])

  useEffect(() => {
    vivo.current = true
    let timer: ReturnType<typeof setTimeout>

    const endereco = participanteId
      ? `/api/quiz/${quizId}/estado?participanteId=${encodeURIComponent(participanteId)}`
      : `/api/quiz/${quizId}/estado`

    async function consultar() {
      if (!vivo.current) return

      if (document.visibilityState === 'visible') {
        try {
          const antes = Date.now()
          const res = await fetch(endereco)
          if (res.ok && vivo.current) {
            const dados = await res.json()
            // Compara com o meio da viagem, para a demora da rede não entrar na conta.
            if (typeof dados.agora === 'number') {
              deslocamento.current = dados.agora - (antes + Date.now()) / 2
              setSincronizado(true)
            }
            setEstado(anterior => ({ ...anterior, ...dados.quiz }))
            setParticipantes(dados.participantes ?? [])
          }
        } catch {
          // Rede oscilando na escola e comum; a proxima tentativa resolve.
        }
      }

      if (vivo.current) timer = setTimeout(consultar, INTERVALO_MS)
    }

    consultar()
    // Voltar para a aba mostra o estado atual sem esperar o proximo ciclo.
    document.addEventListener('visibilitychange', consultar)

    return () => {
      vivo.current = false
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', consultar)
    }
  }, [quizId, participanteId])

  return { estado, setEstado, participantes, agora, sincronizado }
}
