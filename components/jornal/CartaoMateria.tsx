import Image from 'next/image'
import Link from 'next/link'
import { badgeCategoria } from '@/lib/categorias'
import { EDITORIAS, VEREDITOS, dataLonga, type Materia } from '@/lib/jornal/tipos'
import { COR_EDITORIA, COR_VEREDITO } from '@/components/jornal/estilos'

/** Etiqueta da matéria: selo da checagem, tipo ou editoria. Sempre com texto, nunca só cor. */
export function Etiqueta({ m }: { m: Pick<Materia, 'tipo' | 'editoria' | 'veredito' | 'categoria'> }) {
  const base = 'font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border'
  if (m.tipo === 'checagem') return <span className={`${base} border-transparent ${m.veredito ? COR_VEREDITO[m.veredito].fundo : 'bg-slate-600 text-white'}`}>{m.veredito ? VEREDITOS[m.veredito].nome : 'É verdade?'}</span>
  if (m.tipo === 'servico') return <span className={`${base} bg-sky-100 text-sky-800 border-sky-200`}>Serviço</span>
  if (m.tipo === 'memoria') return <span className={`${base} bg-stone-200 text-stone-800 border-stone-300`}>Memória JB</span>
  if (m.editoria) return <span className={`${base} ${COR_EDITORIA[m.editoria]}`}>{EDITORIAS[m.editoria].nome}</span>
  const c = badgeCategoria(m.categoria)
  return c ? <span className={`${base} ${c.bg} ${c.text} ${c.border}`}>{c.label}</span> : null
}

const semOtimizar = (url: string) => url.startsWith('/api/podcast/capa/')

export default function CartaoMateria({ m, assinatura, grande = false }: { m: Materia; assinatura?: string | null; grande?: boolean }) {
  const data = dataLonga(m.publicadoEm ?? m.criadoEm)
  if (grande) {
    return (
      <Link href={`/noticias/${m.slug}`} className="group grid md:grid-cols-[minmax(0,1.1fr)_1fr] bg-white border border-escola-cinza-claro overflow-hidden card-lift">
        <div className="relative h-56 md:h-auto md:min-h-[20rem] bg-escola-creme-escuro">
          {m.imagemUrl ? (
            <Image src={m.imagemUrl} unoptimized={semOtimizar(m.imagemUrl)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-escola-azul to-escola-azul-medio flex items-center justify-center"><span className="font-playfair text-7xl font-black text-white/20">JB</span></div>
          )}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-escola-vermelho" />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3"><Etiqueta m={m} /><time className="font-mono text-xs text-escola-cinza">{data}</time></div>
          <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-4xl leading-tight mb-3 group-hover:text-escola-vermelho transition-colors">{m.titulo}</h2>
          {m.resumo && <p className="font-serif text-escola-cinza text-base leading-relaxed line-clamp-4">{m.resumo}</p>}
          {assinatura && <p className="font-mono text-[11px] text-escola-cinza mt-4">Por {assinatura}</p>}
        </div>
      </Link>
    )
  }
  return (
    <Link href={`/noticias/${m.slug}`} className="group bg-white border border-escola-cinza-claro overflow-hidden card-lift flex flex-col h-full">
      <div className="relative w-full h-44 bg-escola-creme-escuro flex-shrink-0 overflow-hidden">
        {m.imagemUrl ? (
          <Image src={m.imagemUrl} unoptimized={semOtimizar(m.imagemUrl)} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-escola-azul to-escola-azul-medio flex items-center justify-center"><span className="font-playfair text-5xl font-black text-white/20">JB</span></div>
        )}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-escola-vermelho" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2"><Etiqueta m={m} /><time className="font-mono text-[11px] text-escola-cinza">{data}</time></div>
        <h3 className="font-playfair text-escola-preto font-bold text-base leading-snug line-clamp-3 mb-2 group-hover:text-escola-vermelho transition-colors flex-1">{m.titulo}</h3>
        {m.resumo && <p className="font-serif text-escola-cinza text-sm line-clamp-2 mb-3 leading-relaxed">{m.resumo}</p>}
        <div className="pt-3 border-t border-escola-creme-escuro flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-escola-cinza truncate">{assinatura ? `Por ${assinatura}` : ''}</span>
          <span className="font-mono text-[11px] text-escola-vermelho font-medium flex-shrink-0">Leia mais →</span>
        </div>
      </div>
    </Link>
  )
}
