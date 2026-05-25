'use server'

import { createClient } from '@/lib/supabase/server'

export async function enviarLead(formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const mensagem = formData.get('mensagem') as string

  if (!nome?.trim() || !email?.trim()) {
    return { error: 'Nome e e-mail são obrigatórios.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'E-mail inválido.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    nome: nome.trim(),
    email: email.trim(),
    telefone: telefone?.trim() || null,
    mensagem: mensagem?.trim() || null,
  })

  if (error) {
    return { error: 'Erro ao enviar mensagem. Tente novamente.' }
  }

  return { success: true }
}
