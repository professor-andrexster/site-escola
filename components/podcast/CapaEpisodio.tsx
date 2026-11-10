import { Mic, Newspaper } from 'lucide-react'
import { NOME_PODCAST, nomeDoQuadro, type TipoEpisodio } from '@/lib/podcast/tipos'

/** Capa desenhada (sem foto de aluno de propósito): quadro, ícone e o nome do programa. */
export default function CapaEpisodio({ quadro, tipo, grande = false }: { quadro: string | null; tipo: TipoEpisodio; grande?: boolean }) {
  const Icone = tipo === 'entrevista' ? Mic : Newspaper
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-escola-azul via-escola-azul-medio to-escola-vermelho ${grande ? 'aspect-square rounded-2xl' : 'aspect-[4/3]'}`}>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-[18px] border-white/10" />
      <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full border-[10px] border-white/10" />
      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">{NOME_PODCAST}</span>
        <div>
          <Icone className={`${grande ? 'w-12 h-12' : 'w-8 h-8'} mb-2 text-white/90`} />
          <p className={`font-playfair font-black leading-tight ${grande ? 'text-3xl' : 'text-xl'}`}>{nomeDoQuadro(quadro) ?? (tipo === 'entrevista' ? 'Entrevista' : 'Matéria')}</p>
        </div>
      </div>
    </div>
  )
}
