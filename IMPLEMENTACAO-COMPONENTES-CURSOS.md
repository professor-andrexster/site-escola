# Implementação Técnica — Componentes de Cursos

## Visão Geral

Criar 7 componentes React que padronizam TODAS as aulas do Professor André com a marca visual estabelecida.

### Arquivos a Criar

```
components/cursos/
├── SlideCapaCurso.tsx          # Capa do curso com logo { } AG
├── AulaTemplate.tsx            # Wrapper com 7 seções estruturadas
├── ObjetivoBox.tsx             # Box de objetivo de aprendizagem
├── DesafioBox.tsx              # Box de desafio/exercício
├── ResumoBox.tsx               # Box de resumo final
├── CodigoBlock.tsx             # Bloco de código com syntaxe
└── RodapeAula.tsx              # Rodapé padrão
```

---

## 1. SlideCapaCurso.tsx

Capa visual do curso com logo AG, título, subtítulo e metadados.

```tsx
'use client'

import Image from 'next/image'

interface SlideCapaCursoProps {
  numeroAula: number
  titulo: string
  subtitulo?: string
  descricao?: string
  autorNome?: string
  logoUrl?: string
}

export default function SlideCapaCurso({
  numeroAula,
  titulo,
  subtitulo,
  descricao,
  autorNome = 'Professor André Gomes',
  logoUrl,
}: SlideCapaCursoProps) {
  return (
    <div className="bg-curso-papel min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-curso-azul rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-curso-ciano rounded-full blur-3xl"></div>
      </div>

      {/* Logo AG */}
      <div className="mb-8 relative z-10">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo Professor André Gomes"
            width={64}
            height={64}
            className="mx-auto"
          />
        ) : (
          <div className="font-jetbrains text-4xl font-bold text-curso-azul">
            { } AG
          </div>
        )}
      </div>

      {/* Número da aula */}
      <div className="font-jetbrains text-xs uppercase tracking-widest text-curso-texto-suave mb-6 relative z-10">
        Aula {String(numeroAula).padStart(2, '0')}
      </div>

      {/* Decoração: linha azul */}
      <div className="w-16 h-1 bg-curso-azul mb-8 relative z-10 rounded-full"></div>

      {/* Título */}
      <h1 className="font-geom text-5xl md:text-6xl font-black text-curso-azul mb-6 max-w-3xl relative z-10 leading-tight">
        {titulo}
      </h1>

      {/* Subtítulo */}
      {subtitulo && (
        <p className="font-geom text-xl md:text-2xl text-curso-texto-suave mb-8 max-w-2xl relative z-10">
          {subtitulo}
        </p>
      )}

      {/* Descrição */}
      {descricao && (
        <p className="font-geom text-base md:text-lg text-curso-tinta max-w-2xl mb-8 relative z-10 leading-relaxed">
          {descricao}
        </p>
      )}

      {/* Autor */}
      <div className="mt-12 font-geom text-sm text-curso-texto-suave relative z-10">
        por <strong className="text-curso-azul">{autorNome}</strong>
      </div>

      {/* Decoração: linha inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-curso-azul to-transparent"></div>
    </div>
  )
}
```

---

## 2. AulaTemplate.tsx

Wrapper que estrutura uma aula com as 7 seções obrigatórias.

```tsx
'use client'

import { ReactNode } from 'react'
import RodapeAula from './RodapeAula'

interface AulaTemplateProps {
  numeroAula: number
  titulo: string
  objetivo: string
  introducao: ReactNode
  exemplo: ReactNode
  desafio: ReactNode
  resumo: ReactNode
  proximaAula?: { numero: number; titulo: string; href: string }
  aulaAnterior?: { numero: number; titulo: string; href: string }
}

export default function AulaTemplate({
  numeroAula,
  titulo,
  objetivo,
  introducao,
  exemplo,
  desafio,
  resumo,
  proximaAula,
  aulaAnterior,
}: AulaTemplateProps) {
  return (
    <div className="bg-curso-papel min-h-screen">
      {/* Hero com número e título da aula */}
      <div className="bg-gradient-to-r from-curso-azul to-curso-azul-claro text-white px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="font-jetbrains text-xs uppercase tracking-widest text-white/60 mb-4">
            Aula {String(numeroAula).padStart(2, '0')}
          </div>
          <h1 className="font-geom text-4xl md:text-5xl font-black mb-2">
            {titulo}
          </h1>
          <div className="h-1 w-16 bg-curso-ciano rounded-full mt-4"></div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        {/* Objetivo de aprendizagem */}
        <div className="bg-curso-azul/5 border-l-4 border-curso-azul rounded-lg p-6 mb-12">
          <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-texto-suave mb-2">
            objetivo de aprendizagem
          </div>
          <h2 className="font-geom text-xl font-bold text-curso-azul">
            Ao fim desta aula você será capaz de...
          </h2>
          <p className="font-geom text-base text-curso-tinta mt-3 leading-relaxed">
            {objetivo}
          </p>
        </div>

        {/* Introdução / Conceito */}
        <section className="mb-12">
          <h2 className="font-geom text-3xl font-bold text-curso-azul mb-4 pb-3 border-b-2 border-curso-ciano">
            Conceito
          </h2>
          <div className="font-geom text-base text-curso-tinta leading-relaxed space-y-4">
            {introducao}
          </div>
        </section>

        {/* Exemplo prático */}
        <section className="mb-12">
          <h2 className="font-geom text-3xl font-bold text-curso-azul mb-4 pb-3 border-b-2 border-curso-ciano">
            Exemplo Prático
          </h2>
          <div className="space-y-4">
            {exemplo}
          </div>
        </section>

        {/* Desafio/Exercício */}
        <section className="mb-12">
          <div className="bg-curso-papel border-2 border-dashed border-curso-azul rounded-lg p-6">
            <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-azul font-bold mb-2">
              ✏️ Desafio
            </div>
            <h3 className="font-geom text-2xl font-bold text-curso-azul mb-4">
              Teste o que você aprendeu
            </h3>
            <div className="font-geom text-base text-curso-tinta space-y-3">
              {desafio}
            </div>
          </div>
        </section>

        {/* Resumo final */}
        <section className="mb-12">
          <div className="bg-curso-ciano/10 border border-curso-ciano rounded-lg p-6">
            <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-ciano font-bold mb-2">
              ✓ Resumo
            </div>
            <h3 className="font-geom text-2xl font-bold text-curso-ciano mb-4">
              O que aprendemos
            </h3>
            <div className="font-geom text-base text-curso-tinta">
              {resumo}
            </div>
          </div>
        </section>

        {/* Navegação entre aulas */}
        <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t border-curso-linha">
          {aulaAnterior ? (
            <a
              href={aulaAnterior.href}
              className="font-geom text-sm font-semibold text-curso-azul hover:text-curso-ciano transition-colors flex items-center gap-2"
            >
              ← Aula {String(aulaAnterior.numero).padStart(2, '0')}: {aulaAnterior.titulo}
            </a>
          ) : (
            <div></div>
          )}
          {proximaAula ? (
            <a
              href={proximaAula.href}
              className="font-geom text-sm font-semibold text-curso-azul hover:text-curso-ciano transition-colors flex items-center gap-2"
            >
              Aula {String(proximaAula.numero).padStart(2, '0')}: {proximaAula.titulo} →
            </a>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Rodapé */}
      <RodapeAula />
    </div>
  )
}
```

---

## 3. ObjetivoBox.tsx (Simplificado)

Já incluído no AulaTemplate, mas pode ser isolado:

```tsx
interface ObjetivoBoxProps {
  objetivo: string
}

export default function ObjetivoBox({ objetivo }: ObjetivoBoxProps) {
  return (
    <div className="bg-curso-azul/5 border-l-4 border-curso-azul rounded-lg p-6 mb-12">
      <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-texto-suave mb-2">
        objetivo de aprendizagem
      </div>
      <h2 className="font-geom text-xl font-bold text-curso-azul">
        Ao fim desta aula você será capaz de...
      </h2>
      <p className="font-geom text-base text-curso-tinta mt-3 leading-relaxed">
        {objetivo}
      </p>
    </div>
  )
}
```

---

## 4. DesafioBox.tsx

```tsx
import { ReactNode } from 'react'

interface DesafioBoxProps {
  titulo?: string
  children: ReactNode
}

export default function DesafioBox({
  titulo = 'Teste o que você aprendeu',
  children,
}: DesafioBoxProps) {
  return (
    <div className="bg-curso-papel border-2 border-dashed border-curso-azul rounded-lg p-6">
      <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-azul font-bold mb-2">
        ✏️ Desafio
      </div>
      <h3 className="font-geom text-2xl font-bold text-curso-azul mb-4">
        {titulo}
      </h3>
      <div className="font-geom text-base text-curso-tinta space-y-3">
        {children}
      </div>
    </div>
  )
}
```

---

## 5. ResumoBox.tsx

```tsx
import { ReactNode } from 'react'

interface ResumoBoxProps {
  titulo?: string
  children: ReactNode
}

export default function ResumoBox({
  titulo = 'O que aprendemos',
  children,
}: ResumoBoxProps) {
  return (
    <div className="bg-curso-ciano/10 border border-curso-ciano rounded-lg p-6">
      <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-ciano font-bold mb-2">
        ✓ Resumo
      </div>
      <h3 className="font-geom text-2xl font-bold text-curso-ciano mb-4">
        {titulo}
      </h3>
      <div className="font-geom text-base text-curso-tinta">
        {children}
      </div>
    </div>
  )
}
```

---

## 6. CodigoBlock.tsx

```tsx
interface CodigoBlockProps {
  linguagem?: string
  codigo: string
}

export default function CodigoBlock({
  linguagem = 'html',
  codigo,
}: CodigoBlockProps) {
  return (
    <div>
      {linguagem && (
        <div className="font-jetbrains text-xs uppercase tracking-wider text-curso-texto-suave mb-2">
          {linguagem}
        </div>
      )}
      <pre className="bg-curso-tinta text-curso-azul-claro p-4 rounded-lg overflow-x-auto font-jetbrains text-sm leading-relaxed">
        <code>{codigo}</code>
      </pre>
    </div>
  )
}
```

---

## 7. RodapeAula.tsx

```tsx
export default function RodapeAula() {
  return (
    <footer className="bg-curso-azul text-white py-6 text-center">
      <div className="font-geom text-sm font-semibold">
        Professor André Gomes • Desenvolvedor e Educador
      </div>
    </footer>
  )
}
```

---

## Checklist de Implementação

- [ ] Criar todos os 7 componentes em `components/cursos/`
- [ ] Verificar que `tailwind.config.ts` tem cores `curso.*`
- [ ] Criar página de exemplo: `/app/cursos/html/aula-01/page.tsx`
- [ ] Testar estrutura visual com screenshot
- [ ] Passar pelo pipeline de revisão (pedagogia → review → etc)
- [ ] Publicar HTML como primeiro curso padrão
- [ ] Replicar padrão para CSS, JavaScript, etc

---

## Exemplo de Uso

```tsx
// /app/cursos/html/aula-01/page.tsx

import AulaTemplate from '@/components/cursos/AulaTemplate'
import CodigoBlock from '@/components/cursos/CodigoBlock'

export default function Aula01HTML() {
  return (
    <AulaTemplate
      numeroAula={1}
      titulo="Introdução ao HTML"
      objetivo="criar uma página HTML semântica com elementos básicos e estrutura correta."
      introducao={
        <>
          <p>
            HTML significa <strong>HyperText Markup Language</strong>. É a linguagem padrão para criar
            páginas na web.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Estrutura o conteúdo em elementos semânticos</li>
            <li>Funciona junto com CSS (estilo) e JavaScript (interatividade)</li>
            <li>É interpretado pelos navegadores</li>
          </ul>
        </>
      }
      exemplo={
        <>
          <p>Aqui está uma página HTML completa:</p>
          <CodigoBlock
            linguagem="html"
            codigo={`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>Minha Primeira Página</title>
</head>
<body>
    <h1>Olá, mundo!</h1>
    <p>Meu primeiro site.</p>
</body>
</html>`}
          />
        </>
      }
      desafio={
        <>
          <p>Reproduza o exemplo acima em seu editor de texto.</p>
          <p>Depois, altere o título e adicione seu nome no h1.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3 text-sm">
            <strong>Dica:</strong> Abra um editor (VS Code) e salve com .html. Depois abra no navegador.
          </div>
        </>
      }
      resumo={
        <>
          <ul className="list-disc list-inside space-y-2">
            <li>HTML é a linguagem de marcação da web</li>
            <li>Usamos tags para estruturar conteúdo</li>
            <li>Toda página tem &lt;html&gt;, &lt;head&gt; e &lt;body&gt;</li>
          </ul>
        </>
      }
      proximaAula={{ numero: 2, titulo: 'Elementos HTML', href: '/cursos/html/aula-02' }}
    />
  )
}
```

---

## Próximos Passos

1. **Criar componentes** nos arquivos acima
2. **Testar estrutura** com exemplo de HTML
3. **Validar com review-agent** antes de publicar
4. **Criar 6 aulas** para completar trilha de HTML
5. **Replicar padrão** para CSS, JavaScript, etc (em ordem)

---

*Implementação baseada em TEMPLATE-PADRAO-CURSOS.json*
