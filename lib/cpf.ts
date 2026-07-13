/** Remove tudo que não for dígito. */
export function limparCPF(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Valida CPF pelos dígitos verificadores. Aceita com ou sem máscara. */
export function validarCPF(valor: string): boolean {
  const cpf = limparCPF(valor)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // 000..., 111..., etc.

  const digito = (fatia: string, pesoInicial: number) => {
    let soma = 0
    for (let i = 0; i < fatia.length; i++) soma += Number(fatia[i]) * (pesoInicial - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(cpf.slice(0, 9), 10) === Number(cpf[9]) && digito(cpf.slice(0, 10), 11) === Number(cpf[10])
}

/** Formata para 000.000.000-00 (parcial durante digitação). */
export function formatarCPF(valor: string): string {
  const cpf = limparCPF(valor).slice(0, 11)
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}
