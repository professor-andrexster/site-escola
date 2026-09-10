/**
 * Teste das regras de escrita do certificado.
 *
 * Roda contra os TÍTULOS REAIS do banco no fim, porque a regra do traço só
 * vale se sobreviver ao que já está cadastrado: 12 dos 25 cursos publicados
 * têm travessão no nome.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import {
  semTraco, tituloDoCertificado, descricaoDoCertificado, nomeECargo, cargaPorExtenso,
} from '../lib/certificado/texto.ts'

let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }
const eq = (rotulo, obtido, esperado) =>
  ok(rotulo, obtido === esperado, obtido === esperado ? '' : `obtido "${obtido}", esperado "${esperado}"`)

console.log('== traço separador vira pontuação ==')
eq('travessão em título', tituloDoCertificado('Parte 1 — A página existe'), 'Parte 1: A página existe')
eq('travessão em prosa', descricaoDoCertificado('do Professor André Gomes — da interface ao PROCV'),
  'do Professor André Gomes, da interface ao PROCV')
eq('hífen com espaços', semTraco('Excel - do zero'), 'Excel: do zero')

console.log('\n== traço dentro da palavra vira espaço, não some ==')
eq('Back-end', tituloDoCertificado('PHP — Back-end Web'), 'PHP: Back end Web')
eq('nome composto', semTraco('Maria-José', ' '), 'Maria José')

console.log('\n== não sobra espaço solto nem pontuação dobrada ==')
eq('espaço antes de ponto', semTraco('algo — assim .'), 'algo: assim.')
eq('espaços dobrados', semTraco('a  —  b'), 'a: b')
eq('texto sem traço não muda', tituloDoCertificado('Excel do Zero ao PROCV'), 'Excel do Zero ao PROCV')

console.log('\n== nome e cargo da assinatura ==')
let r = nomeECargo('Professor André Gomes')
eq('nome sem o pronome', r.nome, 'André Gomes')
eq('cargo a partir do pronome', r.cargo, 'Professor')
r = nomeECargo('Professora Karelly Brandão')
eq('feminino', r.cargo, 'Professora')
r = nomeECargo('Prof. Tarso')
eq('abreviação vira cargo por extenso', r.cargo, 'Professor')
r = nomeECargo('Rigleia da Silva Pinto Santos', 'Diretora')
eq('sem pronome usa o cargo passado', r.cargo, 'Diretora')
eq('sem pronome mantém o nome', r.nome, 'Rigleia da Silva Pinto Santos')
r = nomeECargo(null)
eq('sem nome cai para a instituição', r.nome, 'E.E. Dr. João Beraldo')

console.log('\n== carga horária por extenso ==')
eq('trinta minutos', cargaPorExtenso(30), 'trinta minutos')
eq('uma hora', cargaPorExtenso(60), 'uma hora')
eq('hora e minutos', cargaPorExtenso(95), 'uma hora e trinta e cinco minutos')
eq('duas horas', cargaPorExtenso(120), 'duas horas')
eq('quinze minutos', cargaPorExtenso(15), 'quinze minutos')
eq('um minuto no singular', cargaPorExtenso(1), 'um minuto'.replace('um', 'uma'))
eq('zero não imprime nada', cargaPorExtenso(0), '')

console.log('\n== contra os dados reais do banco ==')
const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: u.hostname, port: +(u.port || 3306), database: u.pathname.slice(1),
    user: decodeURIComponent(u.username), password: decodeURIComponent(u.password), connectionLimit: 2,
  }),
})

const TRACO = /[-‐‑‒–—―−﹘﹣－]/
const cursos = await prisma.cursos.findMany({
  where: { publicado: true }, select: { titulo: true, descricao: true },
})
const titulosSujos = cursos.map(c => tituloDoCertificado(c.titulo)).filter(t => TRACO.test(t))
const descricoesSujas = cursos.map(c => descricaoDoCertificado(c.descricao)).filter(d => TRACO.test(d))
ok(`${cursos.length} títulos de curso saem sem traço`, titulosSujos.length === 0, titulosSujos.join(' | '))
ok(`${cursos.length} descrições saem sem traço`, descricoesSujas.length === 0, descricoesSujas.slice(0, 2).join(' | '))

const vazios = cursos.map(c => tituloDoCertificado(c.titulo)).filter(t => !t.trim())
ok('nenhum título vira texto vazio', vazios.length === 0)

const alunos = await prisma.certificados.findMany({ select: { aluno_nome: true }, take: 100 })
const nomesSujos = alunos.map(a => semTraco(a.aluno_nome, ' ')).filter(n => TRACO.test(n) || !n.trim())
ok(`${alunos.length} nomes de aluno saem limpos`, nomesSujos.length === 0, nomesSujos.join(' | '))

await prisma.$disconnect()
console.log(`\n${falhas === 0 ? 'ok' : 'FALHA'}: ${falhas} falha(s)`)
process.exit(falhas ? 1 : 0)
