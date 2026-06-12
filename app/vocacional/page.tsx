import VocacionalTest from '@/components/vocacional/VocacionalTest'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teste Vocacional — EMTI',
  description: 'Descubra qual trilha de tecnologia tem mais a ver com você: Excel & Dados, Hardware, Software, Design Digital ou Programação.',
}

export default function VocacionalPage() {
  return <VocacionalTest />
}
