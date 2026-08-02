export function calcularIdade(dataNascimento: string, referencia: Date = new Date()): number {
  const nascimento = new Date(dataNascimento)
  let idade = referencia.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAniversario =
    referencia.getMonth() < nascimento.getMonth() ||
    (referencia.getMonth() === nascimento.getMonth() && referencia.getDate() < nascimento.getDate())
  if (aindaNaoFezAniversario) idade--
  return idade
}

/** Aluno sem data de nascimento cadastrada exige responsavel por seguranca,
 * ate a idade ficar confirmada. */
export function precisaDeResponsavel(tipoLeitor: string, dataNascimento?: string | null): boolean {
  if (tipoLeitor !== 'aluno') return false
  if (!dataNascimento) return true
  return calcularIdade(dataNascimento) < 18
}

export function validarLeitor(dados: {
  tipoLeitor: string
  dataNascimento?: string | null
  nomeResponsavel?: string | null
  telefoneResponsavel?: string | null
}): { ok: true } | { ok: false; erro: string } {
  if (precisaDeResponsavel(dados.tipoLeitor, dados.dataNascimento)) {
    if (!dados.nomeResponsavel?.trim() || !dados.telefoneResponsavel?.trim()) {
      return { ok: false, erro: 'Aluno menor de idade precisa do nome e do telefone do responsável.' }
    }
  }
  return { ok: true }
}
