import { listarTrilhas, projetosPublicos } from '@/lib/db/comunidade'
import PageLayout from '@/components/PageLayout'
import VitrineProjetos from '@/components/projetos/VitrineProjetos'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projetos dos Alunos — JB2026',
  description: 'Conheça os projetos reais criados pelos alunos do EMTI da E.E. Dr. João Beraldo: Excel, Hardware, Software, Design e Programação.',
}

export const revalidate = 60

export default async function ProjetosPage() {
  const [projetos, trilhas] = await Promise.all([projetosPublicos(), listarTrilhas()])

  return (
    <PageLayout>
      <VitrineProjetos projetos={projetos} trilhas={trilhas} />
    </PageLayout>
  )
}
