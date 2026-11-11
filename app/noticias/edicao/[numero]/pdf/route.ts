import { NextResponse } from 'next/server'
import { assinaturas, edicaoPublicada, episodioDaEdicao, materiasDaEdicao } from '@/lib/jornal/dados'
import { pdfDaEdicao } from '@/lib/jornal/pdf'

export const dynamic = 'force-dynamic'

/** Folha da edição para imprimir. Só edição publicada, e só com as matérias que continuam no ar. */
export async function GET(_request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const e = /^\d{1,5}$/.test(numero) ? await edicaoPublicada(Number(numero)) : null
  if (!e) return NextResponse.json({ ok: false, error: 'Edição não encontrada.' }, { status: 404 })
  const [materias, giro] = await Promise.all([materiasDaEdicao(e), episodioDaEdicao(e.episodioId)])
  try {
    const pdf = await pdfDaEdicao(e, materias, {
      base: (process.env.APP_URL ?? 'https://escola.nexialabs.com.br').replace(/\/$/, ''),
      assinaturas: await assinaturas(materias.map(m => m.autorId)),
      giro,
    })
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="jbinforma-edicao-${e.numero}.pdf"`,
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (erro) {
    console.error('[jornal/pdf] edicao', e.numero, erro)
    return NextResponse.json({ ok: false, error: 'Não consegui montar o PDF agora. Tente de novo em instantes.' }, { status: 500 })
  }
}
