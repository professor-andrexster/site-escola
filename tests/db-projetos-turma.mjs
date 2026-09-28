/**
 * Teste da camada lib/db/projetos-turma.ts (aba Projetos) contra o MariaDB.
 * Importa os modulos de verdade via tests/alias.mjs. Limpa o proprio residuo:
 * pasta de serie "Teste Ano" (cascata apaga trabalho, envio e avaliacoes),
 * mais o usuario e a ficha de aluno de teste.
 *
 *   DATABASE_URL=... node --import ./tests/alias.mjs tests/db-projetos-turma.mjs
 */
import { prisma } from '@/lib/db'
import {
  criarPasta, listarPastas, pastaPeloSlug, pastaDaSerie, slugDaSerie,
  criarTrabalho, trabalhosDaPasta, buscarTrabalho, atualizarTrabalho,
  salvarEnvio, envioDoAluno, enviosDoTrabalho, alunosSemEnvio,
  avaliarEnvio, avaliacoesDoEnvio, buscarEnvio,
} from '@/lib/db/projetos-turma'

const SERIE = 'Teste Ano'
const EMAIL = 'projetos-teste@escola.local'
const uid = crypto.randomUUID()
let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }

async function limpar() {
  await prisma.projeto_pastas.deleteMany({ where: { serie: SERIE } })
  await prisma.alunos.deleteMany({ where: { matricula: 'TESTEPROJ01' } })
  await prisma.usuarios.deleteMany({ where: { email: EMAIL } })
}

try {
  await limpar()
  await prisma.usuarios.create({ data: { id: uid, email: EMAIL } })
  await prisma.alunos.create({ data: { nome: 'Aluno Projeto Teste', matricula: 'TESTEPROJ01', turma: SERIE + ' B', serie: SERIE + ' B', user_id: uid } })

  // Pastas
  ok('slugDaSerie("2° Ano") = 2-ano', slugDaSerie('2° Ano') === '2-ano', slugDaSerie('2° Ano'))
  ok('slugDaSerie("3º Ano C") = 3-ano-c', slugDaSerie('3º Ano C') === '3-ano-c', slugDaSerie('3º Ano C'))
  const pasta = await criarPasta(SERIE, null)
  ok('criarPasta devolve serie', pasta.serie === SERIE)
  const porSlug = await pastaPeloSlug(slugDaSerie(SERIE))
  ok('pastaPeloSlug encontra', porSlug?.id === pasta.id)
  const daSerieComLetra = await pastaDaSerie(SERIE + ' B')
  ok('pastaDaSerie("Teste Ano B") cai na pasta "Teste Ano"', daSerieComLetra?.id === pasta.id)
  ok('pastaDaSerie(null) = null', (await pastaDaSerie(null)) === null)

  // Trabalhos
  const rascunho = await criarTrabalho(pasta.id, { titulo: 'Rascunho', resumo: null, briefing: null, arquivoUrl: null, publicado: false }, null)
  const trabalho = await criarTrabalho(pasta.id, { titulo: 'Portfólio Teste', resumo: 'r', briefing: '<p>b</p>', arquivoUrl: '/arquivos/x.pdf', publicado: true }, null)
  ok('ordem incrementa', rascunho.ordem === 1 && trabalho.ordem === 2, `${rascunho.ordem},${trabalho.ordem}`)
  ok('trabalhosDaPasta(apenasPublicados) esconde rascunho', (await trabalhosDaPasta(pasta.id, true)).length === 1)
  ok('trabalhosDaPasta(tudo) traz os dois', (await trabalhosDaPasta(pasta.id, false)).length === 2)
  const lido = await buscarTrabalho(trabalho.id)
  ok('buscarTrabalho traz serie e arquivoUrl', lido?.serie === SERIE && lido?.arquivoUrl === '/arquivos/x.pdf')
  const editado = await atualizarTrabalho(rascunho.id, { publicado: true })
  ok('atualizarTrabalho publica', editado.publicado === true)
  const contagem = (await listarPastas()).find(p => p.id === pasta.id)
  ok('listarPastas conta trabalhos', contagem?.totalTrabalhos === 2 && contagem?.totalPublicados === 2, JSON.stringify(contagem))

  // Envios
  ok('alunosSemEnvio lista o aluno antes do envio', (await alunosSemEnvio(trabalho.id, SERIE)).some(a => a.nome === 'Aluno Projeto Teste'))
  const envio = await salvarEnvio({ trabalhoId: trabalho.id, userId: uid, linkUrl: 'https://a.vercel.app', repoUrl: null, comentario: 'v1' })
  ok('salvarEnvio cria com status enviado', envio.status === 'enviado' && envio.nota === null)
  const denovo = await salvarEnvio({ trabalhoId: trabalho.id, userId: uid, linkUrl: 'https://b.vercel.app', repoUrl: 'https://github.com/x/y', comentario: null })
  ok('salvarEnvio atualiza a mesma linha', denovo.id === envio.id && denovo.linkUrl === 'https://b.vercel.app' && denovo.repoUrl === 'https://github.com/x/y')
  ok('envioDoAluno encontra', (await envioDoAluno(trabalho.id, uid))?.id === envio.id)
  ok('alunosSemEnvio nao lista mais o aluno', !(await alunosSemEnvio(trabalho.id, SERIE)).some(a => a.nome === 'Aluno Projeto Teste'))

  // Avaliacoes
  const avaliado = await avaliarEnvio({ envioId: envio.id, avaliadorId: uid, status: 'ajustar', nota: 6.5, feedback: 'Falta o rodapé' })
  ok('avaliarEnvio espelha status/nota/feedback', avaliado.status === 'ajustar' && avaliado.nota === 6.5 && avaliado.feedback === 'Falta o rodapé' && avaliado.avaliadoEm !== null)
  ok('avaliacoesDoEnvio tem 1 linha', (await avaliacoesDoEnvio(envio.id)).length === 1)
  const reenvio = await salvarEnvio({ trabalhoId: trabalho.id, userId: uid, linkUrl: 'https://c.vercel.app', repoUrl: null, comentario: 'corrigi' })
  ok('reenviar volta para enviado e mantem a devolutiva', reenvio.status === 'enviado' && reenvio.feedback === 'Falta o rodapé')
  await avaliarEnvio({ envioId: envio.id, avaliadorId: uid, status: 'concluido', nota: 10, feedback: null })
  ok('historico acumula 2 avaliacoes', (await avaliacoesDoEnvio(envio.id)).length === 2)
  const daTurma = await enviosDoTrabalho(trabalho.id)
  ok('enviosDoTrabalho traz nome e turma do aluno', daTurma.length === 1 && daTurma[0].aluno.nome === 'Aluno Projeto Teste' && daTurma[0].aluno.turma === SERIE + ' B' && daTurma[0].status === 'concluido')
  const comSerie = await buscarEnvio(envio.id)
  ok('buscarEnvio traz a serie da pasta', comSerie?.serie === SERIE)

  // Cascata
  await prisma.projeto_pastas.delete({ where: { id: pasta.id } })
  ok('apagar a pasta leva envio e avaliacoes (cascata)', (await prisma.projeto_avaliacoes.count({ where: { envio_id: envio.id } })) === 0)
} catch (e) {
  console.error('ERRO', e)
  falhas++
} finally {
  await limpar()
  await prisma.$disconnect()
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo passou')
process.exit(falhas ? 1 : 0)
