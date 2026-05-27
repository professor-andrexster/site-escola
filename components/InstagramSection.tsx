import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const INSTAGRAM_URL = 'https://www.instagram.com/escolajoaoberaldo'
const HANDLE = '@escolajoaoberaldo'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

const placeholderColors = [
  { angle: '135deg', from: '#1a3a5c', to: '#1e4a7a', label: 'Notícias' },
  { angle: '135deg', from: '#1a3a5c', to: '#c0392b33', label: 'Projetos' },
  { angle: '160deg', from: '#0e2238', to: '#1a3a5c', label: 'Eventos' },
  { angle: '120deg', from: '#1a3a5c', to: '#1e4a7a', label: 'Alunos' },
  { angle: '145deg', from: '#c0392b22', to: '#1a3a5c', label: 'EMTI' },
  { angle: '130deg', from: '#0e2238', to: '#1e4a7a', label: 'TI' },
]

export default async function InstagramSection() {
  const supabase = await createClient()

  const { data: noticias } = await supabase
    .from('noticias')
    .select('id, titulo, imagem_url, slug')
    .eq('publicado', true)
    .not('imagem_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  const fotos = noticias ?? []
  const vagasRestantes = Math.max(0, 6 - fotos.length)

  return (
    <section className="border-t border-escola-cinza-claro bg-white py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="border-t-4 border-escola-azul" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-escola-azul flex items-center justify-center text-white">
                <InstagramIcon />
              </div>
              <div>
                <p className="section-label leading-none">Instagram</p>
                <p className="font-mono text-xs text-escola-cinza">{HANDLE}</p>
              </div>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mt-3">
              Siga a Escola
            </h2>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-escola-azul text-white font-mono text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-escola-vermelho transition-colors inline-flex items-center gap-2"
          >
            <InstagramIcon />
            Seguir no Instagram
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-escola-cinza-claro border border-escola-cinza-claro overflow-hidden">
          {/* Fotos reais das notícias */}
          {fotos.map((noticia) => (
            <a
              key={noticia.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group"
              aria-label={noticia.titulo}
            >
              <Image
                src={noticia.imagem_url!}
                alt={noticia.titulo}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <InstagramIcon />
                </span>
              </div>
            </a>
          ))}

          {/* Placeholders para as vagas restantes */}
          {Array.from({ length: vagasRestantes }).map((_, i) => {
            const p = placeholderColors[i % placeholderColors.length]
            return (
              <a
                key={`ph-${i}`}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden group"
                style={{ background: `linear-gradient(${p.angle}, ${p.from}, ${p.to})` }}
              >
                <div className="absolute inset-0 bg-escola-vermelho/0 group-hover:bg-escola-vermelho/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30 group-hover:opacity-50 transition-opacity">
                  <InstagramIcon />
                  <span className="font-mono text-[8px] uppercase tracking-widest text-white">{p.label}</span>
                </div>
                <div className="absolute top-0 left-0 w-3 h-0.5 bg-escola-vermelho opacity-60" />
              </a>
            )
          })}
        </div>

        {/* Caption */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif text-escola-cinza text-sm">
            {fotos.length > 0
              ? 'Fotos das últimas atividades e eventos da escola. Siga para mais conteúdo.'
              : 'Acompanhe as notícias, eventos e projetos da escola no Instagram.'}
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <InstagramIcon />
            {HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}
