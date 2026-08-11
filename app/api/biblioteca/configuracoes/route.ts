import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { configuracao } from '@/lib/db/biblioteca'

// So leitura por enquanto: a tela de edicao de parametros e a fase de
// acabamento do modulo (configurar prazo, limite, multa etc pela interface).
export async function GET() {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const config = await configuracao()
  if (!config) {
    return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })
  }
  return NextResponse.json({ config })
}
