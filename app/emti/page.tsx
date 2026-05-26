import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programa EMTI — Ensino Médio em Tempo Integral',
  description: 'Conheça o Programa EMTI da E.E. Dr. João Beraldo: 9 horas diárias de educação integral, projeto de vida, eletivas e protagonismo juvenil.',
}

export const revalidate = 3600

const pilares = [
  {
    href: '/emti/projeto-vida',
    titulo: 'Projeto de Vida',
    icone: '🎯',
    cor: 'border-escola-vermelho',
    desc: 'Cada aluno constrói seu projeto de vida com apoio de tutores. Autoconhecimento, metas e planejamento do futuro.',
    destaque: 'Autoconhecimento & Planejamento',
  },
  {
    href: '/emti/eletivas',
    titulo: 'Eletivas',
    icone: '📚',
    cor: 'border-escola-azul',
    desc: 'Disciplinas eletivas escolhidas pelos alunos conforme seus interesses. Tecnologia, artes, esportes, empreendedorismo e mais.',
    destaque: 'Aprendizado por interesse',
  },
  {
    href: '/emti/protagonismo',
    titulo: 'Protagonismo Juvenil',
    icone: '⭐',
    cor: 'border-yellow-500',
    desc: 'Alunos como agentes de transformação da escola e da comunidade. Liderança, cidadania e impacto social real.',
    destaque: 'Liderança & Cidadania',
  },
  {
    href: '/emti',
    titulo: 'Tutoria',
    icone: '🤝',
    cor: 'border-green-600',
    desc: 'Acompanhamento individual de cada aluno por um professor-tutor. Desenvolvimento emocional, acadêmico e pessoal.',
    destaque: 'Acompanhamento individual',
  },
]

const horario = [
  { periodo: 'Manhã', horario: '7h00 – 12h00', desc: 'Disciplinas da Base Nacional Comum Curricular (BNCC)' },
  { periodo: 'Almoço', horario: '12h00 – 13h00', desc: 'Refeição oferecida pela escola (merenda escolar)' },
  { periodo: 'Tarde', horario: '13h00 – 16h00', desc: 'Eletivas, Projeto de Vida, Tutoria e Protagonismo Juvenil' },
  { periodo: 'Estudo', horario: '16h00 – 17h00', desc: 'Estudos orientados e atividades complementares' },
]

const diferenciais = [
  { num: '9h', label: 'por dia na escola', desc: 'Jornada ampliada' },
  { num: '200', label: 'dias letivos', desc: 'Calendário completo' },
  { num: '3', label: 'anos de formação', desc: 'Ensino Médio completo' },
  { num: '100%', label: 'público e gratuito', desc: 'Escola estadual' },
]

const areas = [
  { nome: 'Linguagens', icone: '✍️', materias: ['Língua Portuguesa', 'Literatura', 'Inglês', 'Espanhol', 'Arte', 'Educação Física'] },
  { nome: 'Ciências da Natureza', icone: '🔬', materias: ['Biologia', 'Química', 'Física'] },
  { nome: 'Matemática', icone: '📐', materias: ['Matemática', 'Estatística e Probabilidade'] },
  { nome: 'Ciências Humanas', icone: '🌍', materias: ['História', 'Geografia', 'Filosofia', 'Sociologia'] },
]

export default function EmtiPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[520px] overflow-hidden">
        <Image src="/fachada.jpg" alt="E.E. Dr. João Beraldo" fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,58,92,0.96) 0%, rgba(26,58,92,0.7) 60%, transparent 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-3xl">
          <p className="section-label text-white/70 mb-2">Programa educacional</p>
          <div className="w-12 h-0.5 bg-escola-vermelho mb-5" />
          <h1 className="font-playfair text-white font-black text-3xl md:text-5xl lg:text-6xl leading-tight mb-4">
            Ensino Médio<br />em Tempo Integral
          </h1>
          <p className="font-serif text-white/85 text-base md:text-lg leading-relaxed max-w-xl">
            9 horas diárias de formação integral: conhecimento acadêmico, desenvolvimento pessoal e preparação para o futuro.
          </p>
          <div className="flex gap-4 mt-8">
            <Link href="/contato" className="bg-escola-vermelho text-white font-mono text-sm uppercase tracking-widest px-6 py-3 hover:bg-escola-vermelho-escuro transition-colors">
              Saiba mais →
            </Link>
          </div>
        </div>
      </div>

      {/* Diferenciais */}
      <div className="bg-escola-vermelho text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {diferenciais.map((d) => (
              <div key={d.num} className="px-5 py-6 text-center">
                <div className="font-playfair font-black text-3xl md:text-4xl leading-none mb-1">{d.num}</div>
                <div className="font-serif text-sm text-white/80 mb-0.5">{d.label}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/50">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* O que é o EMTI */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <AnimateOnScroll>
              <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
              <p className="section-label mt-4 mb-2">Entenda o modelo</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-6">
                O que é o EMTI?
              </h2>
              <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base">
                <p>
                  O <strong>Ensino Médio em Tempo Integral (EMTI)</strong> é um modelo educacional inovador que amplia
                  a jornada escolar para <strong>9 horas diárias</strong>, integrando o currículo nacional com
                  componentes de formação pessoal e profissional.
                </p>
                <p>
                  Na E.E. Dr. João Beraldo, o EMTI foi implantado em <strong>2020</strong>, tornando a escola
                  pioneira na região de Carlos Chagas. O programa vai além do conteúdo acadêmico tradicional:
                  ele coloca o aluno como protagonista da sua própria formação.
                </p>
                <p>
                  Por meio de <strong>Eletivas</strong>, <strong>Projeto de Vida</strong>, <strong>Tutoria</strong> e
                  atividades de <strong>Protagonismo Juvenil</strong>, os estudantes desenvolvem habilidades
                  socioemocionais, constroem projetos de futuro e se preparam para o mercado de trabalho e o
                  ensino superior.
                </p>
                <p>
                  Todas as refeições são oferecidas pela escola. Não há custo adicional para as famílias.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <aside className="md:col-span-2">
            <AnimateOnScroll delay={1}>
              <div className="bg-escola-azul text-white p-6 mb-5">
                <div className="w-8 h-0.5 bg-escola-vermelho mb-4" />
                <h3 className="font-playfair font-bold text-lg mb-4">Horário do EMTI</h3>
                <div className="space-y-4">
                  {horario.map((h) => (
                    <div key={h.periodo} className="border-b border-white/10 pb-3 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs uppercase tracking-wider text-white/60">{h.periodo}</span>
                        <span className="font-playfair font-bold text-escola-vermelho text-sm">{h.horario}</span>
                      </div>
                      <p className="font-serif text-white/75 text-xs leading-relaxed">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-escola-creme border border-escola-cinza-claro p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho mb-2">Atenção</p>
                <p className="font-serif text-escola-cinza text-sm leading-relaxed">
                  Merenda escolar inclusa. Transporte fornecido para alunos da zona rural mediante cadastro.
                  Matrículas abertas conforme calendário da SEE-MG.
                </p>
              </div>
            </AnimateOnScroll>
          </aside>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="bg-escola-creme-escuro py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
            <p className="section-label mt-4 mb-1">Componentes do programa</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
              Os 4 Pilares do EMTI
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pilares.map((pilar, i) => (
              <AnimateOnScroll key={pilar.titulo} delay={(i % 2 + 1) as 1|2}>
                <Link href={pilar.href} className={`group bg-white border-t-4 ${pilar.cor} border-l border-r border-b border-escola-cinza-claro p-7 flex flex-col card-lift block`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{pilar.icone}</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-escola-cinza">{pilar.destaque}</span>
                  </div>
                  <h3 className="font-playfair font-bold text-escola-azul text-xl mb-3 group-hover:text-escola-vermelho transition-colors">
                    {pilar.titulo}
                  </h3>
                  <p className="font-serif text-escola-cinza text-sm leading-relaxed flex-1">
                    {pilar.desc}
                  </p>
                  <span className="font-mono text-xs text-escola-vermelho mt-5 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Saiba mais <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Curricular areas */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <AnimateOnScroll>
          <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
          <p className="section-label mt-4 mb-1">Currículo base</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
            Áreas do Conhecimento
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {areas.map((area, i) => (
            <AnimateOnScroll key={area.nome} delay={(i % 4) as 0|1|2|3}>
              <div className="bg-white border border-escola-cinza-claro p-5 card-lift">
                <span className="text-2xl mb-3 block">{area.icone}</span>
                <div className="w-6 h-0.5 bg-escola-vermelho mb-3" />
                <h3 className="font-playfair font-bold text-escola-azul text-sm mb-3">{area.nome}</h3>
                <ul className="space-y-1.5">
                  {area.materias.map((m) => (
                    <li key={m} className="font-serif text-escola-cinza text-xs flex items-start gap-1.5">
                      <span className="text-escola-vermelho mt-0.5">·</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-azul-pattern py-14">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <AnimateOnScroll>
            <div className="w-12 h-0.5 bg-escola-vermelho mx-auto mb-6" />
            <h2 className="font-playfair text-white font-black text-2xl md:text-3xl mb-4">
              Quer matricular seu filho no EMTI?
            </h2>
            <p className="font-serif text-white/75 mb-8 leading-relaxed">
              Entre em contato conosco para saber sobre vagas disponíveis, documentação necessária e o calendário de matrículas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contato" className="bg-escola-vermelho text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-escola-vermelho-escuro transition-colors">
                Fale Conosco →
              </Link>
              <a href="https://wa.me/5533998701618" target="_blank" rel="noopener noreferrer"
                className="bg-white/10 border border-white/20 text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/20 transition-colors">
                WhatsApp
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
