import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'

// So leitura por enquanto: a tela de edicao de parametros e a fase de
// acabamento do modulo (configurar prazo, limite, multa etc pela interface).
export async function GET() {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const admin = createAdminClient()
  const { data: config, error } = await admin.from('biblioteca_configuracoes').select('*').eq('id', true).maybeSingle()
  if (error || !config) return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })
  return NextResponse.json({ config })
}
