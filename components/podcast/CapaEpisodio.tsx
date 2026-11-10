import { Mic, Newspaper } from 'lucide-react'
import { NOME_PODCAST, type TipoEpisodio } from '@/lib/podcast/tipos'

/**
 * Capa do episodio. Sem foto: capa desenhada (quadro, icone e nome do programa).
 * Com foto (so quando o termo de quem aparece marcou "fotografia"): a foto com
 * uma faixa escura embaixo para o nome do quadro continuar legivel.
 */
export default function CapaEpisodio({ quadroNome, tipo, grande = false, capaUrl = null }: { quadroNome: string | null; tipo: TipoEpisodio; grande?: boolean; capaUrl?: string | null }) {
  const Icone = tipo === 'entrevista' ? Mic : Newspaper
  const rotulo = quadroNome ?? (tipo === 'entrevista' ? 'Entrevista' : 'Matéria')
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-escola-azul via-escola-azul-medio to-escola-vermelho ${grande ? 'aspect-square rounded-2xl' : 'aspect-[4/3]'}`}>
      {capaUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- rota privada com no-store: o otimizador do Next guardaria copia */}
          <img src={capaUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
        </>
      ) : (
        <>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-[18px] border-white/10" />
          <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full border-[10px] border-white/10" />
        </>
      )}
      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/80">{NOME_PODCAST}</span>
        <div>
          {!capaUrl && <Icone className={`${grande ? 'w-12 h-12' : 'w-8 h-8'} mb-2 text-white/90`} />}
          <p className={`font-playfair font-black leading-tight ${grande ? 'text-3xl' : 'text-xl'}`}>{rotulo}</p>
        </div>
      </div>
    </div>
  )
}
