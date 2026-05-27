import Image from 'next/image'

const YOUTUBE_HANDLE = 'joaoberaldocarloschagas'
const YOUTUBE_URL = `https://www.youtube.com/@${YOUTUBE_HANDLE}`
const HANDLE = `@${YOUTUBE_HANDLE}`
const CHANNEL_ID = 'UC5vWD-q1Z4zmVu0cs8XI-AQ'

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
    <path d="M8 5v14l11-7z" />
  </svg>
)

interface VideoItem {
  videoId: string
  title: string
}

const placeholders = [
  { label: 'Aulas', angle: '135deg', from: '#1a0a0a', to: '#8b0000' },
  { label: 'Eventos', angle: '150deg', from: '#8b0000', to: '#1a0a0a' },
  { label: 'Projetos', angle: '140deg', from: '#1a0a0a', to: '#c0392b' },
  { label: 'EMTI', angle: '125deg', from: '#8b0000', to: '#1a0a0a' },
  { label: 'TI', angle: '155deg', from: '#1a0a0a', to: '#8b0000' },
  { label: 'Escola', angle: '130deg', from: '#c0392b', to: '#1a0a0a' },
]

async function getLatestVideos(): Promise<VideoItem[]> {
  try {
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { next: { revalidate: 3600 } }
    )
    if (!rssRes.ok) return []

    const xml = await rssRes.text()
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []

    return entries
      .slice(0, 6)
      .map((entry) => {
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ''
        const rawTitle = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
        const title = rawTitle
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
        return { videoId, title }
      })
      .filter((v) => v.videoId)
  } catch {
    return []
  }
}

export default async function YoutubeSection() {
  const videos = await getLatestVideos()
  const vagasRestantes = Math.max(0, 6 - videos.length)

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

        {/* Grid de vídeos */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-escola-cinza-claro border border-escola-cinza-claro overflow-hidden">
          {/* Thumbnails dos vídeos reais */}
          {videos.map((video) => (
            <a
              key={video.videoId}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group"
              title={video.title}
            >
              <Image
                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay com botão play */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <PlayIcon />
                </div>
              </div>
            </a>
          ))}

          {/* Placeholders para vagas restantes */}
          {Array.from({ length: vagasRestantes }).map((_, i) => {
            const p = placeholders[i % placeholders.length]
            return (
              <a
                key={`ph-${i}`}
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden group"
                style={{ background: `linear-gradient(${p.angle}, ${p.from}, ${p.to})` }}
              >
                <div className="absolute inset-0 bg-[#FF0000]/0 group-hover:bg-[#FF0000]/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30 group-hover:opacity-50 transition-opacity">
                  <YoutubeIcon />
                  <span className="font-mono text-[8px] uppercase tracking-widest text-white">{p.label}</span>
                </div>
                <div className="absolute top-0 left-0 w-3 h-0.5 bg-[#FF0000] opacity-60" />
              </a>
            )
          })}
        </div>

        {/* Caption */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif text-escola-cinza text-sm">
            {videos.length > 0
              ? `${videos.length} vídeos mais recentes do canal. Inscreva-se para não perder nenhum.`
              : 'Vídeos sobre projetos, eventos e a vida escolar da E.E. Dr. João Beraldo.'}
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
