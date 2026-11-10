import { servirDoEpisodio } from '@/lib/podcast/servir'

interface Ctx { params: Promise<{ id: string }> }

/** Audio do episodio (pasta privada). Regras em lib/podcast/servir.ts. */
export async function GET(request: Request, { params }: Ctx) {
  return servirDoEpisodio(request, (await params).id, 'audio')
}
