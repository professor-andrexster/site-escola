import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { saidasDeTela } from '@/lib/db/quiz'

/** Alunos que sairam da tela durante o quiz — so o telao do professor ve. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params
  return NextResponse.json({ saidas: await saidasDeTela(id) })
}
