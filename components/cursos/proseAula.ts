/**
 * Estilo do HTML da aula no tema escuro do player.
 *
 * Vive aqui porque os DOIS visualizadores usam: o ConteudoViewer (aula em
 * texto) e o SlideViewer (aula em slides, que passou a mostrar o texto abaixo
 * dos slides). Duplicar levaria a uma das telas divergir da outra com o tempo.
 */
export const proseAula = [
  '[&_h2]:text-white [&_h2]:font-black [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-geom',
  '[&_h3]:text-white [&_h3]:font-bold [&_h3]:text-base md:[&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:text-white/70 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[15px]',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
  '[&_li]:text-white/70 [&_li]:mb-1.5 [&_li]:text-[15px]',
  '[&_strong]:text-white [&_em]:text-white/80',
  '[&_code]:font-jetbrains [&_code]:text-curso-ciano [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]',
  // A cor vai no `pre`, não só no `pre code`: conteúdo com <pre> sem <code>
  // dentro herdava a cor do corpo do documento e saía preto sobre preto —
  // contraste 1:1, texto invisível.
  '[&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:text-white/80 [&_pre]:font-jetbrains [&_pre]:text-[13px]',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/80',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-curso-azul [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-white/60 [&_blockquote]:italic',
  // A tabela vinha com grade e fundo próprios no HTML da aula, desenhados para
  // um tema claro: cabeçalho `#f0f0f0` e texto herdado escuro, que no player
  // escuro sumia. As cores saíram do conteúdo e passaram para cá, onde o tema
  // manda. A rolagem horizontal é para a tabela larga não empurrar a página.
  '[&_table]:w-full [&_table]:my-5 [&_table]:border-collapse [&_table]:text-[14px]',
  '[&_th]:bg-white/[0.07] [&_th]:text-white [&_th]:font-bold [&_th]:text-left [&_th]:p-2.5 [&_th]:border [&_th]:border-white/15',
  '[&_td]:text-white/70 [&_td]:p-2.5 [&_td]:border [&_td]:border-white/10 [&_td]:align-top',
  '[&_tr:nth-child(even)_td]:bg-white/[0.02]',
].join(' ')

/** Estilo do enunciado de desafio, menor que o da aula. */
export const proseDesafio =
  '[&_p]:text-white/70 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-white/70 [&_li]:text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:font-jetbrains [&_code]:text-curso-ciano [&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:text-white/80 text-white/70 text-sm leading-relaxed'
