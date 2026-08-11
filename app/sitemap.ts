import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'

const BASE = 'https://escolaestadualdrjoaoberaldo.com'

// Regenera de hora em hora: notícia ou curso novo entra no sitemap sem
// depender de um deploy.
export const revalidate = 3600

type Entrada = MetadataRoute.Sitemap[number]

const ROTAS_FIXAS: Array<{
  path: string
  changeFrequency: Entrada['changeFrequency']
  priority: number
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/sobre', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/emti', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/emti/eletivas', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/emti/projeto-vida', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/emti/protagonismo', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/cursos', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/noticias', changeFrequency: 'daily', priority: 0.8 },
  { path: '/projetos', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/vocacional', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/ranking', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/quiz', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contato', changeFrequency: 'yearly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date()

  const fixas: MetadataRoute.Sitemap = ROTAS_FIXAS.map(rota => ({
    url: `${BASE}${rota.path}`,
    lastModified: agora,
    changeFrequency: rota.changeFrequency,
    priority: rota.priority,
  }))

  // Se o Supabase estiver fora do ar na hora do build, o sitemap sai só com as
  // rotas fixas em vez de derrubar o deploy inteiro.
  try {
    const supabase = createStaticClient()

    const [{ data: cursos }, { data: noticias }] = await Promise.all([
      supabase.from('cursos').select('slug').eq('publicado', true),
      supabase.from('noticias').select('slug, updated_at').eq('publicado', true),
    ])

    const entradasCursos: MetadataRoute.Sitemap = (cursos ?? [])
      .filter(c => c.slug)
      .map(c => ({
        url: `${BASE}/cursos/${c.slug}`,
        lastModified: agora,
        changeFrequency: 'monthly',
        priority: 0.7,
      }))

    const entradasNoticias: MetadataRoute.Sitemap = (noticias ?? [])
      .filter(n => n.slug)
      .map(n => ({
        url: `${BASE}/noticias/${n.slug}`,
        lastModified: n.updated_at ? new Date(n.updated_at) : agora,
        changeFrequency: 'yearly',
        priority: 0.6,
      }))

    return [...fixas, ...entradasCursos, ...entradasNoticias]
  } catch {
    return fixas
  }
}
