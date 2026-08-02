import type { SupabaseClient } from '@supabase/supabase-js'

/** Proximo tombo disponivel para o prefixo configurado, calculado pelo maior
 * numero ja usado (nao pela ordenacao textual, que quebra quando ha tombo
 * digitado a mao com tamanho diferente do gerado automaticamente). */
export async function gerarProximoTombo(admin: SupabaseClient, prefixo: string): Promise<string> {
  const { data } = await admin
    .from('biblioteca_exemplares')
    .select('tombo')
    .like('tombo', `${prefixo}%`)

  let maiorNumero = 0
  for (const row of data ?? []) {
    const numero = parseInt(row.tombo.slice(prefixo.length), 10)
    if (!Number.isNaN(numero) && numero > maiorNumero) maiorNumero = numero
  }

  return `${prefixo}${String(maiorNumero + 1).padStart(6, '0')}`
}
