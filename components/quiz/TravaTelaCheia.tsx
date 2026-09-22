'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize, ShieldAlert } from 'lucide-react'

/**
 * Trava anti-cola do quiz (2026-09-22, pedido do André).
 *
 * Nenhum navegador deixa prender o aluno numa tela. O que dá para fazer é
 * pedir tela cheia e perceber quando ele sai dela, troca de aba ou tira o foco
 * da janela. Nessas horas o quiz some atrás de um aviso até ele voltar, e a
 * saída é contada para o professor ver no telão. Não tira ponto; o relógio da
 * pergunta continua correndo, então sair custa tempo.
 *
 * Safari do iPhone não tem tela cheia para páginas: lá só vale a troca de aba.
 */
export default function TravaTelaCheia({
  participanteId,
  children,
}: {
  participanteId: string
  children: React.ReactNode
}) {
  const [suportaTelaCheia, setSuportaTelaCheia] = useState(false)
  const [emTelaCheia, setEmTelaCheia] = useState(true)
  const [saiu, setSaiu] = useState(false)
  const [saidas, setSaidas] = useState(0)
  // Navegador que recusa tela cheia (app embutido, política do sistema): o
  // aluno não pode ficar preso no aviso. Segue sem tela cheia, e a troca de
  // aba continua contando.
  const [telaCheiaRecusada, setTelaCheiaRecusada] = useState(false)
  // Só conta saída de quem já esteve dentro; a primeira entrada não é saída.
  const esteveDentroRef = useRef(false)
  const foraRef = useRef(false)

  useEffect(() => {
    const suporta = typeof document !== 'undefined' && !!document.fullscreenEnabled
    setSuportaTelaCheia(suporta)
    const dentro = !suporta || !!document.fullscreenElement
    setEmTelaCheia(dentro)
    esteveDentroRef.current = dentro

    function marcarSaida() {
      if (!esteveDentroRef.current || foraRef.current) return
      foraRef.current = true
      setSaiu(true)
      setSaidas(n => n + 1)
      fetch('/api/quiz/saida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participanteId }),
        keepalive: true,
      }).catch(() => {})
    }

    function aoMudarTelaCheia() {
      const dentro = !!document.fullscreenElement
      if (dentro) setTelaCheiaRecusada(false)
      setEmTelaCheia(dentro)
      if (dentro) esteveDentroRef.current = true
      else marcarSaida()
    }

    function aoMudarVisibilidade() {
      if (document.hidden) marcarSaida()
    }

    document.addEventListener('fullscreenchange', aoMudarTelaCheia)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    window.addEventListener('blur', marcarSaida)
    return () => {
      document.removeEventListener('fullscreenchange', aoMudarTelaCheia)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
      window.removeEventListener('blur', marcarSaida)
    }
  }, [participanteId])

  async function voltar() {
    if (suportaTelaCheia && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
      } catch {
        setTelaCheiaRecusada(true)
      }
    }
    esteveDentroRef.current = true
    foraRef.current = false
    setSaiu(false)
  }

  const bloqueado = saiu || (suportaTelaCheia && !telaCheiaRecusada && !emTelaCheia)
  const primeiraEntrada = !saiu && saidas === 0

  return (
    <>
      {children}
      {bloqueado && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-5">
              {primeiraEntrada ? <Maximize className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 text-amber-400" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {primeiraEntrada ? 'O quiz começou' : 'Você saiu da tela do quiz'}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {primeiraEntrada
                ? 'O quiz roda em tela cheia. Não saia dela nem troque de aba até o fim.'
                : `A saída foi registrada e o professor vê no telão (${saidas} ${saidas === 1 ? 'vez' : 'vezes'}). O tempo da pergunta continua correndo.`}
            </p>
            <button
              onClick={voltar}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3.5 rounded-xl font-bold hover:bg-white/90 transition-colors"
            >
              <Maximize className="w-4 h-4" />
              {primeiraEntrada ? 'Entrar em tela cheia' : 'Voltar para o quiz'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
