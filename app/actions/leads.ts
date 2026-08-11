'use server'

import { criarLead } from '@/lib/db/comunidade'

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

  // Sem checagem de permissao de proposito: e o formulario de contato do site
  // publico, e qualquer visitante pode enviar. As demais server actions do
  // sistema (em /admin/leads) exigem gestao, porque server action e endpoint
  // publico e o RLS nao esta mais ali para barrar.
  try {
    await criarLead({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone?.trim() || null,
      mensagem: mensagem?.trim() || null,
    })
    return { success: true }
  } catch (erro) {
    console.error('[actions/leads] falha ao registrar contato', erro)
    return { error: 'Erro ao enviar mensagem. Tente novamente.' }
  }
}
