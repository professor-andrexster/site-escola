# PROMPT_CURSOS.md — Montagem dos Cursos da Grade EMTI

> Cole este arquivo no Claude Code, na raiz do projeto, ao lado do `CLAUDE.md`.
> Ele instrui o Claude Code a montar todos os cursos da grade de Informática do
> EE Doutor João Beraldo, sprint por sprint, passando pelo pipeline de revisão.

---

## Contexto

Escola: **EE Doutor João Beraldo — SRE Teófilo Otoni** (146579).
Programa: **Ensino Médio em Tempo Integral (EMTI)** — Informática.
Região dos alunos: **Vale do Mucuri** (Teófilo Otoni e Carlos Chagas).

Você já tem o `CLAUDE.md` do projeto. Siga a estrutura de tabelas
(`cursos`, `aulas`, `desafios`), os agentes e o pipeline de revisão descritos lá.

---

## Objetivo desta tarefa

Para **cada disciplina** da grade abaixo, criar um curso completo:

1. Rodar o **`curriculo-agent`** (Agente 13) para pesquisar o tema e gerar a ementa
   e as **sprints** (blocos de 2 a 4 aulas + desafio de fechamento).
2. Popular as tabelas `cursos` e `aulas` com o esqueleto retornado.
3. Passar **cada aula** pelo pipeline obrigatório:
   `pedagogia-agent → review-agent → plagio-fonte-agent → acessibilidade-conteudo-agent → desafio-agent`.
4. Rodar o **`trilha-agent`** ao fim de cada curso para validar a ordem das aulas.
5. Só marcar `revisado=true` e `publicado=true` quando todos os agentes bloqueantes
   aprovarem.

---

## Regras inegociáveis (valem para toda aula e desafio)

- **Linguagem humana.** Escreva como um professor da região falando com adolescentes.
  Nada de abertura tipo "na era digital", nada de "em suma", nada de listas de três
  por hábito, nada de "não só... mas também" repetido.
- **Sem o travessão "—" e sem " - " como pausa.** Reescreva com vírgula, ponto,
  dois-pontos ou parênteses. O texto final não pode conter esses sinais separando
  ideias.
- **Versões sempre atuais e verificadas na web.** Nunca escreva número de versão de
  memória. Em 2026: para novos projetos, **PHP 8.5** (estável recomendado) e
  **Java 21 LTS** como alvo padrão, citando **Java 25 LTS** como opção de ponta.
  Confirme antes de fixar qualquer versão.
- **Desafios de verdade.** Cada aula tem ao menos um desafio que testa o que ela
  ensinou; cada curso tem um projeto integrador no fim.
- **Economia circular embutida** onde a disciplina permitir (reaproveitamento de
  hardware, eficiência de código e energia, ciclo de vida de equipamentos). Não
  force onde não couber.
- **Acessibilidade de conteúdo:** alt text descritivo nas imagens, glossário na
  primeira aparição de termo técnico, frases de comprimento variado.

---

## Cursos a montar

### 1º Ano
1. **Cultura Digital e Fundamentos** — `area: fundamentos`
   Base de informática, cidadania digital, hardware e software, internet com
   responsabilidade.

### 2º Ano
2. **Lógica de Programação** — `area: programacao`
   *(montar ANTES de Java e de JavaScript — é pré-requisito dos dois)*
   Algoritmos, variáveis, condicionais, laços, funções.
3. **P.O.O / Java** — `area: programacao`
   Orientação a objetos com Java. Alvo Java 21 LTS; citar Java 25 LTS.
   Pré-requisito: Lógica de Programação.
4. **HTML / CSS** — `area: web`
   *(montar ANTES de Programação Web / JavaScript)*
   Estrutura e estilo de páginas. HTML Living Standard e CSS atual.
5. **Programação Web (JavaScript)** — `area: web`
   Interatividade no navegador. Pré-requisitos: Lógica de Programação e HTML/CSS.
6. **Sistemas Operacionais** — `area: sistemas`
   Conceitos de SO, arquivos, processos, linha de comando.
7. **Arquitetura e Manutenção** — `area: hardware`
   Montagem e manutenção de computadores, com forte eixo de reaproveitamento de
   equipamentos (economia circular).
8. **Gestão do Tempo** — `area: produtividade`
   Organização pessoal e ferramentas digitais de planejamento.

### 3º Ano
9. **Redes de Computadores** — `area: redes`
   Topologias, protocolos, endereçamento IP, segurança básica.
10. **Programação Web II (PHP)** — `area: web`
    Back-end com PHP na versão estável atual (confirmar; ex.: PHP 8.5).
    Pré-requisitos: Lógica de Programação, HTML/CSS.
11. **Gerenciador de Conteúdo** — `area: web`
    Instalar, configurar e publicar num CMS. Amarrar ao próprio site da escola
    como projeto real.

### Extra
12. **Pacote Office** — `area: produtividade`
    Editor de texto, planilhas e apresentações, com ênfase prática. Sugestão de
    sprints: Documentos → Planilhas (fórmulas e gráficos) → Apresentações →
    Projeto integrado (um trabalho escolar real feito nas três ferramentas).

---

## Ordem de execução recomendada

```
Para cada curso da lista (respeitando os pré-requisitos):
    1. curriculo-agent   → gera ementa + sprints (JSON)
    2. cria curso + aulas (esqueleto) no banco
    3. para cada aula:
         pedagogia-agent → review-agent → plagio-fonte-agent
         → acessibilidade-conteudo-agent → desafio-agent
    4. trilha-agent      → valida a sequência do curso inteiro
    5. publica o curso quando tudo aprovado
```

Comece pelos pré-requisitos: **Lógica de Programação** e **HTML/CSS** antes dos
cursos que dependem deles. Ao terminar cada curso, gere um resumo curto do que foi
criado (nº de sprints, nº de aulas, nº de desafios) antes de passar ao próximo.

---

## Saída esperada por curso

- 1 registro em `cursos`
- N registros em `aulas` (todas com `revisado=true`)
- Desafios em `desafios` (por aula + fechamento de sprint + projeto integrador)
- Relatório curto: sprints, aulas, desafios e as tecnologias/versões usadas com fonte.
