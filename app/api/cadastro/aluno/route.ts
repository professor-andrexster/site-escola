import { NextResponse } from 'next/server'
import { criarConta, removerConta, EmailJaCadastrado } from '@/lib/auth/sessao'
import { fichasSemConta, proximaMatricula } from '@/lib/db/alunos'
import { criarCadastroDeAluno, CpfJaVinculado, MatriculaEmCorrida } from '@/lib/db/cadastro'
import { TURMAS, turmaCompativel } from '@/lib/turmas'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'
import { senhaFraca } from '@/lib/auth/senha'

/**
 * Auto-cadastro de aluno.
 *
 * Antes o formulario pedia matricula + CPF + nascimento e conferia os tres
 * contra a ficha da secretaria: quem nao batesse, nao entrava. Na pratica isso
 * barrava mais aluno de verdade do que impostor — 22 das 32 fichas nao tinham
 * CPF e 23 nao tinham nascimento, entao o proprio sistema recusava gente cuja
 * ficha estava incompleta ("Seu cadastro na secretaria ainda esta incompleto").
 *
 * Agora o aluno informa nome, turma e nascimento. Nada disso prova identidade,
 * e a rota nao finge que prova: a conferencia passou a ser humana, na tela de
 * aprovacao, que era onde ela sempre terminava de qualquer forma.
 *
 * O que a rota ainda faz sozinha e tentar casar com uma ficha existente por
 * nome + turma, para nao criar registro duplicado de quem a secretaria ja
 * cadastrou. Nao achando, cria a ficha — porque conta de aluno sem ficha e
 * conta quebrada (`alunos.user_id` e o que o "meu perfil" consulta).
 */

/** Normaliza para comparar nome digitado com nome de ficha. */
function chaveDoNome(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tira acento: "João" e "Joao" sao a mesma pessoa
    .toLowerCase()
    .replace(/\s+/g, ' ')            // espaco duplo digitado nao pode separar
    .trim()
}

export async function POST(request: Request) {
  const body = await request.json()
  const { nome, turma, dataNascimento, email, senha, emailAlternativo } = body as {
    nome?: string
    turma?: string
    dataNascimento?: string
    email?: string
    senha?: string
    emailAlternativo?: string
  }

  const ip = ipDoRequest(request)

  if (!nome?.trim() || !turma?.trim() || !email?.trim() || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }

  const nomeLimpo = nome.trim().replace(/\s+/g, ' ')
  if (nomeLimpo.length < 5 || !nomeLimpo.includes(' ')) {
    return NextResponse.json(
      { error: 'Informe o nome completo, com sobrenome.' },
      { status: 400 }
    )
  }

  if (!(TURMAS as readonly string[]).includes(turma)) {
    return NextResponse.json({ error: 'Selecione uma turma válida.' }, { status: 400 })
  }

  const fraca = senhaFraca(senha)
  if (fraca) {
    return NextResponse.json({ error: fraca }, { status: 400 })
  }

  const nascimento = dataNascimento ? new Date(dataNascimento) : null
  if (dataNascimento && Number.isNaN(nascimento!.getTime())) {
    return NextResponse.json({ error: 'Data de nascimento inválida.' }, { status: 400 })
  }

  // Rate limit. Antes contava 'cadastro_recusado', que fazia sentido quando a
  // matricula podia nao bater — hoje nao existe mais recusa, e esse contador
  // ficaria parado em zero para sempre.
  //
  // O que precisa de freio agora e a criacao em si: sem matricula e CPF, nada
  // impede um script de abrir centenas de contas pendentes, e cada uma ainda
  // cria uma ficha na base da escola. A aprovacao barra o acesso, mas nao
  // impede o lixo.
  //
  // O teto por IP e alto de proposito: a escola inteira sai pelo mesmo IP, e
  // uma turma se cadastrando junto na sala de informatica e o caso normal.
  const chaveNome = chaveDoNome(nomeLimpo)
  const [porNome, porIp] = await Promise.all([
    contarRecentes({ acao: 'cadastro_aluno', janelaMin: 60, chave: 'chaveNome', valor: chaveNome }),
    ip ? contarRecentes({ acao: 'cadastro_aluno', janelaMin: 60, ip }) : Promise.resolve(0),
  ])
  if (porNome >= 3) {
    return NextResponse.json(
      { error: 'Já existe um cadastro recente com esse nome. Use "Esqueci minha senha" ou procure a secretaria.' },
      { status: 429 }
    )
  }
  if (porIp >= 40) {
    return NextResponse.json(
      { error: 'Muitos cadastros a partir deste local. Aguarde alguns minutos ou procure a secretaria.' },
      { status: 429 }
    )
  }

  // Casa com a ficha da secretaria, se houver uma sem dono com esse nome e
  // turma. `nome + turma` e unico na base hoje; havendo empate, nenhuma e
  // escolhida — chutar a ficha errada daria a um aluno o historico de outro.
  const candidatas = (await fichasSemConta()).filter(
    f => chaveDoNome(f.nome) === chaveNome && turmaCompativel(turma, f.turma)
  )

  // Nascimento so desempata quando a ficha tem o dado (23 das 32 nao tem).
  const comNascimento = nascimento
    ? candidatas.filter(
        f =>
          f.data_nascimento &&
          f.data_nascimento.toISOString().slice(0, 10) === dataNascimento
      )
    : []
  const escolhidas = comNascimento.length === 1 ? comNascimento : candidatas
  const ficha = escolhidas.length === 1 ? escolhidas[0] : null

  if (candidatas.length > 1 && !ficha) {
    await registrar({
      acao: 'cadastro_ficha_ambigua',
      detalhes: { nome: nomeLimpo, turma, candidatas: candidatas.length },
      ip,
    })
  }

  // A conta de acesso vem primeiro e sozinha: ela e a unica coisa que precisa
  // ser desfeita na mao se a transacao seguinte falhar.
  let userId: string
  try {
    userId = await criarConta(email, senha)
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof EmailJaCadastrado
            ? 'Já existe uma conta com esse email. Use "Esqueci minha senha".'
            : 'Erro ao criar a conta. Tente novamente.',
      },
      { status: 400 }
    )
  }

  const comum = {
    userId,
    nome: nomeLimpo,
    turma,
    email: email.trim().toLowerCase(),
    dataNascimento: nascimento,
    emailAlternativo: emailAlternativo?.trim() || null,
    aprovado: false,
  }

  try {
    let origem
    if (ficha) {
      origem = await criarCadastroDeAluno({ ...comum, alunoId: ficha.id })
    } else {
      // Duas inscricoes no mesmo instante pegam a mesma matricula; o unique do
      // banco recusa a segunda e aqui ela tenta o proximo numero.
      let tentativa = 0
      for (;;) {
        try {
          origem = await criarCadastroDeAluno({ ...comum, matricula: await proximaMatricula() })
          break
        } catch (erro) {
          if (erro instanceof MatriculaEmCorrida && tentativa++ < 5) continue
          throw erro
        }
      }
    }

    // `chaveNome` vai gravado porque e por ele que o rate limit acima conta —
    // comparar pelo nome cru deixaria "Ana Silva" e "ana  silva" passarem como
    // pessoas diferentes.
    await registrar({
      acao: 'cadastro_aluno',
      userId,
      detalhes: { nome: nomeLimpo, chaveNome, turma, origem },
      ip,
    })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[cadastro/aluno] falha ao criar cadastro', erro)
    await removerConta(userId)
    return NextResponse.json(
      {
        error:
          erro instanceof CpfJaVinculado
            ? erro.message
            : 'Erro ao salvar seus dados. Tente novamente.',
      },
      { status: 400 }
    )
  }
}
