import { prisma } from '@/lib/db'

/**
 * Criacao de conta — a parte que mexe em tres tabelas de uma vez.
 *
 * O fluxo tem duas metades que nao podem ser uma transacao so: a conta de
 * acesso vive fora do banco (Supabase Auth hoje, tabela `usuarios` na fase 4),
 * e profiles/identidades/alunos vivem dentro.
 *
 * O codigo antigo desfazia na mao, em degraus: se identidades falhava, apagava
 * profiles; se profiles falhava, apagava a conta. Cada degrau era um `await`
 * solto que podia falhar tambem, e ai sobrava metade.
 *
 * Aqui as tres tabelas viram uma transacao. A rota so precisa desfazer UMA
 * coisa quando ela falha: a conta de acesso.
 */

export class CpfJaVinculado extends Error {}

/** Como a conta chegou na ficha: casada com uma que ja existia, ou ficha nova. */
export type OrigemDaFicha = 'ficha_existente' | 'ficha_nova'

/**
 * Cadastro do aluno que se inscreve sozinho.
 *
 * O aluno nao digita mais matricula nem CPF (22 das 32 fichas de producao nao
 * tinham CPF, e o formulario exigia). Sobrou nome + turma + nascimento, que
 * nao identificam ninguem com certeza — entao a rota resolve a ficha antes e
 * passa o resultado aqui:
 *
 *  - achou ficha sem dono batendo nome e turma  -> `alunoId`, so vincula;
 *  - nao achou                                   -> `fichaNova`, cria a ficha.
 *
 * Criar a ficha e obrigatorio, nao conveniencia: `alunos.user_id` e o unico
 * vinculo entre conta e registro academico, e sem ele o "meu perfil" responde
 * 404 e o aluno fica sem portfolio e sem vocacional. Deixar a conta solta
 * transformaria em regra o bug que ja custou investigacao.
 *
 * Quem valida se a pessoa e mesmo quem diz continua sendo o professor, na tela
 * de aprovacao — por isso `criado_via` distingue os dois casos: e o que faz a
 * tela avisar que aquela ficha nasceu ali, e nao veio da secretaria.
 */
export async function criarCadastroDeAluno(dados: {
  userId: string
  nome: string
  turma: string
  email: string
  dataNascimento: Date | null
  emailAlternativo?: string | null
  aprovado: boolean
} & (
  | { alunoId: string; matricula?: undefined }
  | { alunoId?: undefined; matricula: string }
)): Promise<OrigemDaFicha> {
  const origem: OrigemDaFicha = dados.alunoId ? 'ficha_existente' : 'ficha_nova'

  try {
    await prisma.$transaction(async tx => {
      await tx.profiles.create({
        data: {
          id: dados.userId,
          nome_completo: dados.nome,
          role: 'aluno',
          turma: dados.turma,
          disciplina: null,
          aprovado: dados.aprovado,
          email: dados.email,
        },
      })

      await tx.identidades.create({
        data: {
          user_id: dados.userId,
          // Sem CPF no formulario a coluna fica nula — ela ja e anulavel, e o
          // unique nao reclama de varios nulos.
          cpf: null,
          data_nascimento: dados.dataNascimento,
          email_alternativo: dados.emailAlternativo ?? null,
          criado_via: origem === 'ficha_nova' ? 'auto_aluno_novo' : 'auto_aluno',
        },
      })

      // O vinculo ficha<->conta: alunos.user_id. Nao identidades.aluno_id,
      // que nao existe.
      if (dados.alunoId) {
        await tx.alunos.update({
          where: { id: dados.alunoId },
          data: { user_id: dados.userId },
        })
      } else {
        await tx.alunos.create({
          data: {
            nome: dados.nome,
            matricula: dados.matricula!,
            turma: dados.turma,
            // `serie` e NOT NULL e na base de producao repete a turma.
            serie: dados.turma,
            data_nascimento: dados.dataNascimento,
            email: dados.email,
            user_id: dados.userId,
          },
        })
      }
    })
    return origem
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      // Qual unique estourou muda o que dizer e o que fazer. Matricula e
      // corrida entre dois cadastros simultaneos: quem chama repete com o
      // proximo numero. Email ja e do aluno, e repetir nao adianta.
      const alvo = (erro as { meta?: { target?: string[] | string } }).meta?.target
      const campos = Array.isArray(alvo) ? alvo.join(',') : String(alvo ?? '')
      if (campos.includes('matricula')) throw new MatriculaEmCorrida()
      if (campos.includes('email')) {
        throw new CpfJaVinculado('Já existe um cadastro da escola com esse e-mail. Procure a direção.')
      }
      throw new CpfJaVinculado('Esses dados já estão vinculados a outra conta. Procure a direção.')
    }
    throw erro
  }
}

/** Duas inscricoes pegaram a mesma matricula. Recuperavel: basta repetir. */
export class MatriculaEmCorrida extends Error {}

/**
 * Mesma ideia para conta criada por quem administra — pode nao ser de aluno.
 *
 * `criadoVia` e parametro e nao constante porque o sistema usa cinco valores
 * diferentes, e no banco de producao ja existem tres deles: 'direcao',
 * 'gestao' e 'auto_professor'. Fixar um so aqui reescreveria a origem de
 * cadastros futuros e estragaria o rastro de quem criou o que.
 */
export async function criarContaInterna(dados: {
  userId: string
  nome: string
  role: string
  turma?: string | null
  disciplina?: string | null
  email: string
  cpf: string
  dataNascimento?: Date | null
  matricula?: string | null
  criadoVia: string
  /** Conta criada pela gestao nasce aprovada; autocadastro nao. */
  aprovado: boolean
}) {
  try {
    return await prisma.$transaction(async tx => {
      await tx.profiles.create({
        data: {
          id: dados.userId,
          nome_completo: dados.nome,
          role: dados.role,
          turma: dados.turma ?? null,
          disciplina: dados.disciplina ?? null,
          aprovado: dados.aprovado,
          email: dados.email,
        },
      })

      await tx.identidades.create({
        data: {
          user_id: dados.userId,
          cpf: dados.cpf,
          data_nascimento: dados.dataNascimento ?? null,
          criado_via: dados.criadoVia,
        },
      })

      // Se for aluno com matricula, liga a ficha academica — mas so quando ela
      // ainda nao tem conta, para nao roubar o vinculo de outra.
      let vinculo: string | null = null
      if (dados.matricula) {
        const ficha = await tx.alunos.findFirst({
          where: { matricula: dados.matricula, user_id: null },
          select: { id: true, matricula: true },
        })
        if (ficha) {
          await tx.alunos.update({ where: { id: ficha.id }, data: { user_id: dados.userId } })
          vinculo = ficha.matricula
        }
      }
      return { vinculo }
    })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      throw new CpfJaVinculado('Esse CPF já está vinculado a outra conta.')
    }
    throw erro
  }
}

/**
 * De onde veio a ficha ligada a esta conta: 'auto_aluno_novo' quando o proprio
 * auto-cadastro a criou, 'auto_aluno' quando casou com uma da secretaria.
 * Outros valores ('direcao', 'gestao', 'auto_professor') sao conta criada por
 * dentro. Devolve null se nao ha identidade.
 */
export async function origemDoCadastro(userId: string): Promise<string | null> {
  const i = await prisma.identidades.findUnique({
    where: { user_id: userId },
    select: { criado_via: true },
  })
  return i?.criado_via ?? null
}

/** Apaga a ficha de uma conta. So para ficha que o proprio cadastro criou. */
export async function removerFichaDaConta(userId: string) {
  return prisma.alunos.deleteMany({ where: { user_id: userId } })
}
