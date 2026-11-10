'use client'

import { useEffect } from 'react'

const ID_SCRIPT = 'bussola-chamados'
const SRC_SCRIPT = 'https://andredev.nexialabs.com.br/painel/chamado.js'

/**
 * Botão "Chamados" do Bussola, para a equipe da escola.
 *
 * Busca a assinatura do dia em `/api/suporte/widget`. A rota já resolve quem
 * pode ver: aluno e usuário não aprovado recebem 204/401 e nada acontece
 * aqui. Por isso é seguro renderizar este componente em qualquer layout de
 * `/admin`, mesmo os que alunos também usam — o script só carrega para quem
 * a API liberou.
 */
export default function BotaoChamados() {
  useEffect(() => {
    let cancelado = false

    async function carregar() {
      let resposta: Response
      try {
        resposta = await fetch('/api/suporte/widget', { cache: 'no-store' })
      } catch {
        return
      }
      if (cancelado || resposta.status !== 200) return

      const dados = await resposta.json().catch(() => null)
      if (cancelado || !dados) return

      if (document.getElementById(ID_SCRIPT)) return

      const script = document.createElement('script')
      script.id = ID_SCRIPT
      // data-* precisam ser fixados ANTES de anexar o script ao documento —
      // é assim que chamado.js lê a própria configuração ao carregar.
      script.dataset.sistema = dados.sistema
      script.dataset.usuarioId = dados.usuarioId
      script.dataset.usuario = dados.nome
      script.dataset.email = dados.email
      script.dataset.papel = dados.papel
      script.dataset.assinatura = dados.assinatura
      script.src = SRC_SCRIPT
      script.async = true
      document.body.appendChild(script)
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  return null
}
