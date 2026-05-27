const YOUTUBE_URL = 'https://www.youtube.com/@joaoberaldocarloschagas'
const HANDLE = '@joaoberaldocarloschagas'

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const placeholders = [
  { label: 'Aulas', angle: '135deg', from: '#1a0a0a', to: '#8b0000' },
  { label: 'Eventos', angle: '150deg', from: '#8b0000', to: '#1a0a0a' },
  { label: 'Projetos', angle: '140deg', from: '#1a0a0a', to: '#c0392b' },
  { label: 'EMTI', angle: '125deg', from: '#8b0000', to: '#1a0a0a' },
  { label: 'TI', angle: '155deg', from: '#1a0a0a', to: '#8b0000' },
  { label: 'Escola', angle: '130deg', from: '#c0392b', to: '#1a0a0a' },
]

export default function YoutubeSection() {
  return (
    <section className="border-t border-escola-cinza-claro bg-white py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="border-t-4 border-escola-azul" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FF0000] flex items-center justify-center text-white">
                <YoutubeIcon />
              </div>
              <div>
                <p className="section-label leading-none">YouTube</p>
                <p className="font-mono text-xs text-escola-cinza">{HANDLE}</p>
              </div>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mt-3">
              Assista ao Canal
            </h2>
          </div>

          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-[#FF0000] text-white font-mono text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <YoutubeIcon />
            Ver no YouTube
          </a>
        </div>

        {/* Grid */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
          aria-label="Ver canal do YouTube da E.E. Dr. João Beraldo"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-escola-cinza-claro border border-escola-cinza-claro overflow-hidden">
            {placeholders.map((p) => (
              <div
                key={p.label}
                className="relative aspect-square overflow-hidden"
                style={{ background: `linear-gradient(${p.angle}, ${p.from}, ${p.to})` }}
              >
                <div className="absolute inset-0 bg-[#FF0000]/0 group-hover:bg-[#FF0000]/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30 group-hover:opacity-50 transition-opacity">
                  <YoutubeIcon />
                  <span className="font-mono text-[8px] uppercase tracking-widest text-white">{p.label}</span>
                </div>
                <div className="absolute top-0 left-0 w-3 h-0.5 bg-[#FF0000] opacity-60" />
              </div>
            ))}
          </div>
        </a>

        {/* Caption */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif text-escola-cinza text-sm">
            Vídeos sobre projetos, eventos e a vida escolar da E.E. Dr. João Beraldo.
          </p>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-[#FF0000] hover:text-escola-azul transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <YoutubeIcon />
            {HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}
