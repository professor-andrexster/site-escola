'use client'

import { useEffect, useRef, useState } from 'react'

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
          const res = await fetch(endereco)
          if (res.ok && vivo.current) {
            const dados = await res.json()
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

  return { estado, setEstado, participantes }
}
