'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Leva a rolagem ao topo a cada troca de página.
 *
 * O Next já faz isso — mas na JANELA. Aqui quem rola é o `<main>` dos layouts
 * do painel, que tem `overflow-auto`. A janela nunca sai do topo, então não há
 * o que restaurar, e o container interno guarda o deslocamento anterior.
 *
 * O efeito para quem usa: você desce até o fim de uma página longa, clica numa
 * aula, e a aula abre no mesmo deslocamento — que numa página mais curta é o
 * rodapé. Parecia "o curso abre no final da página".
 *
 * Procura o ancestral que de fato rola em vez de fixar no `<main>`: alguns
 * layouts aninham containers, e o certo é zerar aquele que tem barra.
 */
export default function RolagemAoTopo() {
  const caminho = usePathname()

  useEffect(() => {
    // A âncora (#secao) é intencional: nesse caso o destino não é o topo.
    if (window.location.hash) return

    const principal = document.querySelector('main')
    if (principal) principal.scrollTop = 0

    // Cobre também o caso de a página rolar na janela, fora do painel.
    window.scrollTo(0, 0)
  }, [caminho])

  return null
}
