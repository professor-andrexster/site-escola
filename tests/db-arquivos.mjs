/**
 * Arquivos em disco (fase 5).
 *
 * Nao toca no banco — o nome comeca com `db-` so para o runner pegar. O que
 * precisa ficar preso aqui: o tipo sai dos BYTES e nao do nome, o caminho
 * pedido pela URL nao escapa da raiz, e o que veio do Supabase e servido como
 * anexo (os buckets antigos nunca validaram tipo nenhum).
 */
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

process.env.UPLOAD_ROOT = mkdtempSync(path.join(tmpdir(), 'jb-arquivos-'))

const { gravar, caminhoNoDisco, ehAnexo, finalidadeValida, PREFIXO_PUBLICO } =
  await import('@/lib/storage/arquivos')

let falhas = 0
const ok = (rotulo, cond, extra = '') => {
  console.log(`${cond ? 'ok   ' : 'FALHA'} ${rotulo}${extra ? ' — ' + extra : ''}`)
  if (!cond) falhas++
}

const arquivo = (nome, bytes) => new File([new Uint8Array(bytes)], nome)
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]

// ----------------------------------------------------------- finalidade
ok('finalidade conhecida passa', finalidadeValida('avatar'))
ok('finalidade inventada nao passa', !finalidadeValida('../etc'))
ok('finalidade vazia nao passa', !finalidadeValida(''))

// ------------------------------------------------------------- gravacao
const png = await gravar('avatar', arquivo('foto.png', PNG), 'usuario-1')
ok('imagem legitima e gravada', 'url' in png && png.url.startsWith(`${PREFIXO_PUBLICO}/avatares/`))

const mentiroso = await gravar('avatar', arquivo('foto.png', [0x3c, 0x68, 0x74, 0x6d, 0x6c]), 'usuario-1')
ok('arquivo que nao e imagem e recusado, mesmo com nome .png', 'erro' in mentiroso)

const vazio = await gravar('avatar', arquivo('vazio.png', []), 'usuario-1')
ok('arquivo vazio e recusado', 'erro' in vazio)

const gigante = await gravar('avatar', arquivo('grande.png', [...PNG, ...new Array(6 * 1024 * 1024).fill(0)]), 'usuario-1')
ok('arquivo acima do limite e recusado', 'erro' in gigante)

// O nome pedido pelo cliente nao vira caminho.
const travessia = await gravar('avatar', arquivo('../../../etc/passwd.png', PNG), 'usuario-1')
ok('nome com ../ nao escapa da pasta',
   'url' in travessia && travessia.url.startsWith(`${PREFIXO_PUBLICO}/avatares/`) &&
   !travessia.caminho.includes('..'))

// Entrega de desafio aceita qualquer tipo, mas a extensao e sanitizada.
const entrega = await gravar('desafio', arquivo('projeto.zip', [1, 2, 3]), 'usuario-1')
ok('entrega de desafio aceita tipo livre', 'url' in entrega && entrega.caminho.endsWith('.zip'))

const extensaoTorta = await gravar('desafio', arquivo('x.php%00.jpg/../', [1, 2, 3]), 'usuario-1')
ok('extensao malformada vira .bin', 'url' in extensaoTorta && extensaoTorta.caminho.endsWith('.bin'))

// Dois envios do mesmo nome nao se sobrescrevem.
const a = await gravar('avatar', arquivo('foto.png', PNG), 'usuario-1')
const b = await gravar('avatar', arquivo('foto.png', PNG), 'usuario-1')
ok('dois envios do mesmo nome geram arquivos distintos',
   'url' in a && 'url' in b && a.url !== b.url)

// ------------------------------------------------------------- leitura
ok('caminho normal resolve', caminhoNoDisco(['avatares', 'x.png']) !== null)
ok('caminho com .. e recusado', caminhoNoDisco(['..', '..', 'etc', 'passwd']) === null)
ok('caminho que sobe de dentro de uma pasta e recusado',
   caminhoNoDisco(['avatares', '..', '..', '..', 'etc', 'passwd']) === null)

ok('entrega de desafio e servida como anexo', ehAnexo('desafios/x.zip'))
ok('arquivo vindo do Supabase e servido como anexo', ehAnexo('legado/imagens/x.png'))
ok('imagem enviada pelo site nao e anexo', !ehAnexo('avatares/x.png'))

process.exit(falhas ? 1 : 0)
