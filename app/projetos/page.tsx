import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import VitrineProjetos from '@/components/projetos/VitrineProjetos'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projetos dos Alunos — JB2026',
  description: 'Conheça os projetos reais criados pelos alunos do EMTI da E.E. Dr. João Beraldo: Excel, Hardware, Software, Design e Programação.',
}

export const revalidate = 60

export default async function ProjetosPage() {
  const supabase = await createClient()

  const { data: projetos } = await supabase
    .from('projetos')
    .select(`
      id, titulo, descricao, imagem_url, link_externo, tags, destaque, criado_em,
      trilhas(nome, icone, cor_tailwind),
      alunos(nome, matricula, serie, turma, ativo)
    `)
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  const { data: trilhas } = await supabase.from('trilhas').select('*').order('nome')

  const ativos = (projetos ?? []).filter(p => {
    const aluno = Array.isArray(p.alunos) ? p.alunos[0] : p.alunos
    return aluno?.ativo
  })

  return (
    <PageLayout>
      <VitrineProjetos projetos={ativos} trilhas={trilhas ?? []} />
    </PageLayout>
  )
}
