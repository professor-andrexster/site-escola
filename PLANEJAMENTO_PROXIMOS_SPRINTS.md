# Planejamento dos próximos sprints

Pedidos do André em 02/08/2026, pensados aqui antes de codar. Cada item
tem a proposta de desenho, o que precisa de decisão dele, e o tamanho
estimado. Nada disso foi implementado ainda.

## 1. Progressão por módulo nos cursos

**Pedido:** aluno só muda de módulo depois de completar o módulo atual e
fazer a prova.

**Proposta:** o portão já existe, é o certificado. Curso ganha uma coluna
`prerequisito_curso_id` (referência para outro curso). Um curso com
pré-requisito só abre (página, player e prova) se o aluno tiver
**certificado** do curso anterior, conferido no servidor, não só escondido
na tela. No card da vitrine, curso travado aparece com cadeado e o texto
"Conclua [nome do pré-requisito] primeiro".

- Migration pequena: `ALTER TABLE cursos ADD COLUMN prerequisito_curso_id uuid REFERENCES cursos(id)`.
- No formulário de curso, um select "Pré-requisito" listando os outros cursos.
- Checagem em: página do curso, player de aula, rota da prova.
- Encadeando pré-requisitos, vira trilha de módulos (Lógica → POO → Web...).

**Decidir:** se módulo = curso inteiro (proposta acima, simples) ou se um
curso interno se divide em módulos (bem mais schema; só se precisar).

**Tamanho:** meio dia.

## 2. Primeiro ano sem cursos avançados

**Pedido:** aluno do 1º ano não acessa cursos avançados de programação e
banco de dados.

**Proposta:** curso ganha `ano_minimo` (1, 2, 3 ou vazio = todos). A turma
do aluno já diz o ano dele (`profiles.turma`, formato "1° Ano...", parser
pronto em `lib/turmas.ts`). Curso com `ano_minimo = 2` fica travado para
quem é do 1º ano, com aviso honesto ("disponível a partir do 2º ano").
Professor e gestão sempre veem tudo. Combina com o item 1: o curso avançado
pode ter as duas travas ao mesmo tempo.

- Migration: `ALTER TABLE cursos ADD COLUMN ano_minimo int CHECK (ano_minimo IN (1,2,3))`.
- Mesmos três pontos de checagem do item 1 (dá pra fazer os dois juntos).

**Tamanho:** junto com o item 1, um dia os dois.

## 3. Adaptação para alunos especiais

**Pedido:** adaptar o sistema para os alunos especiais que estudam na escola.

**Proposta em duas partes:**

*Parte A, o que o sistema já pode oferecer para todo mundo (sem cadastro
de condição, sem dado sensível):*
- Botão de tamanho de fonte (A− / A+) no player de aula e no quiz.
- Prova final de curso já é sem tempo; manter assim.
- Revisão de contraste e navegação por teclado nas telas de aluno
  (foco visível já existe; falta conferir o player de slides).

*Parte B, o que depende de saber quem precisa (dado sensível, LGPD):*
- Tempo estendido no quiz ao vivo: um multiplicador por aluno
  (ex.: 1,5x no relógio de cada pergunta). Precisa de um campo por perfil.
- Esse campo NÃO deve ficar visível no painel geral: tabela separada
  (`apoios_aluno`), leitura só para gestão e professor, nunca exposta em
  ranking ou tela pública.

**Decidir (importante, antes de codar a parte B):** conversar com a
professora de AEE da escola sobre o que de fato ajuda os alunos que temos
hoje. Adaptação boa nasce do caso real, não do palpite do desenvolvedor.

**Tamanho:** parte A meio dia; parte B um dia depois da conversa com o AEE.

## 4. Cadastro de gente de fora da escola

**Pedido:** permitir cadastro de quem não é da escola, com autonomia.
Resolver em outro dia, mas já deixar pensado.

**Proposta:** papel novo `comunidade`.
- Autocadastro público numa aba própria ("Sou da comunidade"), pedindo
  nome, CPF, email e telefone. Nasce pendente, gestão aprova, no mesmo
  fluxo de aprovação que já existe (a "autonomia" fica com a escola:
  ninguém entra sem aprovação).
- Acesso: só cursos marcados como abertos à comunidade, um flag novo
  `aberto_comunidade` no curso, decidido curso a curso pelo professor.
  Certificado funciona igual, o que é um atrativo real pra comunidade.
- Biblioteca: o tipo de leitor `comunidade` JÁ existe no schema da
  biblioteca (limite 1 livro, 7 dias, configurável). A bibliotecária
  cadastra o leitor normalmente; nada a construir aí.
- Menu do papel: Dashboard, Meu Perfil, Cursos. Nada de quiz, ideias,
  desafios.

**Decidir:** se o autocadastro fica aberto direto no site ou se começa
com a gestão criando as contas (dá pra lançar com gestão criando e abrir
o autocadastro depois, menor risco).

**Tamanho:** um dia.

## Ordem sugerida

1 e 2 juntos (mesmas telas, mesmas checagens) → 4 (destrava público novo)
→ 3 parte A → 3 parte B (depois da conversa com o AEE).
