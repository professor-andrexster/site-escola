/**
 * Estilo do HTML da aula no tema escuro do player.
 *
 * Vive aqui porque os DOIS visualizadores usam: o ConteudoViewer (aula em
 * texto) e o SlideViewer (aula em slides, que passou a mostrar o texto abaixo
 * dos slides). Duplicar levaria a uma das telas divergir da outra com o tempo.
 *
 * ------------------------------------------------------------------ tamanhos
 *
 * O corpo era 15px e subiu para 17px. Não é preferência: 16px é o padrão do
 * navegador e o piso usual para texto corrido, e a aula é justamente o texto
 * que o aluno lê por quinze minutos seguidos, muitas vezes num celular ruim, em
 * sala clara. A medição do `auditar-tamanho-fonte.mjs` achou 653 trechos de
 * leitura abaixo do piso — quase todos vinham daqui.
 *
 * Código fica um pouco menor que o corpo (15px contra 17px), que é a convenção
 * de qualquer material técnico: monoespaçada no mesmo corpo do texto parece
 * maior do que é, porque ocupa mais largura por caractere.
 */
export const proseAula = [
  '[&_h2]:text-white [&_h2]:font-black [&_h2]:text-[22px] md:[&_h2]:text-[26px] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-geom',
  '[&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[18px] md:[&_h3]:text-[20px] [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:text-white/70 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[17px]',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
  '[&_li]:text-white/70 [&_li]:mb-2 [&_li]:text-[17px]',
  '[&_strong]:text-white [&_em]:text-white/80',
  '[&_code]:font-jetbrains [&_code]:text-curso-ciano [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[15px]',
  // A cor vai no `pre`, não só no `pre code`: conteúdo com <pre> sem <code>
  // dentro herdava a cor do corpo do documento e saía preto sobre preto —
  // contraste 1:1, texto invisível.
  '[&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:text-white/80 [&_pre]:font-jetbrains [&_pre]:text-[15px] [&_pre]:leading-relaxed',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/80',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-curso-azul [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-white/60 [&_blockquote]:italic',
  // A tabela vinha com grade e fundo próprios no HTML da aula, desenhados para
  // um tema claro: cabeçalho `#f0f0f0` e texto herdado escuro, que no player
  // escuro sumia. As cores saíram do conteúdo e passaram para cá, onde o tema
  // manda. A rolagem horizontal é para a tabela larga não empurrar a página.
  '[&_table]:w-full [&_table]:my-5 [&_table]:border-collapse [&_table]:text-[16px]',
  '[&_th]:bg-white/[0.07] [&_th]:text-white [&_th]:font-bold [&_th]:text-left [&_th]:p-2.5 [&_th]:border [&_th]:border-white/15',
  '[&_td]:text-white/70 [&_td]:p-2.5 [&_td]:border [&_td]:border-white/10 [&_td]:align-top',
  '[&_tr:nth-child(even)_td]:bg-white/[0.02]',
].join(' ')

/**
 * Estilo do enunciado de desafio.
 *
 * Era deliberadamente menor que o da aula, e isso estava errado: o enunciado é
 * o que o aluno relê enquanto FAZ o trabalho, com a tela dividida entre o
 * navegador e o editor. Agora acompanha o corpo da aula.
 */
export const proseDesafio = [
  '[&_p]:text-white/70 [&_p]:text-[17px] [&_p]:leading-relaxed [&_p]:mb-3',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:text-white/70 [&_li]:text-[17px] [&_li]:mb-1.5',
  '[&_strong]:text-white',
  '[&_code]:font-jetbrains [&_code]:text-curso-ciano [&_code]:text-[15px]',
  '[&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:text-[15px] [&_pre]:text-white/80 [&_pre]:font-jetbrains',
  'text-white/70 text-[17px] leading-relaxed',
].join(' ')
