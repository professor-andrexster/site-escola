import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Target, BookOpen, Award, Users,
  PenLine, FlaskConical, Calculator, Globe,
  Clock, ChevronRight, Cpu, Monitor, Network, Code,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Programa EMTI — Ensino Médio em Tempo Integral',
  description: 'Conheça o Programa EMTI da E.E. Dr. João Beraldo: 9 horas diárias, formação técnica em TI, projeto de vida, eletivas e protagonismo juvenil.',
}

export const revalidate = 3600

const pilares = [
  {
    href: '/emti/projeto-vida',
    titulo: 'Projeto de Vida',
    subtitulo: 'Autoconhecimento & Planejamento',
    Icon: Target,
    desc: 'Cada aluno constrói seu projeto de vida com apoio de tutores. Autoconhecimento, definição de metas e planejamento para o futuro.',
  },
  {
    href: '/emti/eletivas',
    titulo: 'Eletivas',
    subtitulo: 'Aprendizado por interesse',
    Icon: BookOpen,
    desc: 'Disciplinas escolhidas pelos alunos conforme seus interesses. Tecnologia, comunicação, empreendedorismo, artes e muito mais.',
  },
  {
    href: '/emti/protagonismo',
    titulo: 'Protagonismo Juvenil',
    subtitulo: 'Liderança & Cidadania',
    Icon: Award,
    desc: 'Alunos como agentes de transformação da escola e da comunidade. Projetos reais com impacto social mensurável.',
  },
  {
    href: '/emti',
    titulo: 'Tutoria',
    subtitulo: 'Acompanhamento individual',
    Icon: Users,
    desc: 'Acompanhamento individual de cada aluno por um professor-tutor. Desenvolvimento acadêmico, emocional e pessoal contínuo.',
  },
]

const horario = [
  { periodo: 'Manhã', horario: '7h00 – 12h00', desc: 'Base Nacional Comum Curricular (BNCC)' },
  { periodo: 'Almoço', horario: '12h00 – 13h00', desc: 'Refeição oferecida pela escola' },
  { periodo: 'Tarde', horario: '13h00 – 16h00', desc: 'Eletivas, Projeto de Vida e Protagonismo' },
  { periodo: 'Extensão', horario: '16h00 – 17h00', desc: 'Estudos orientados e atividades complementares' },
]

const diferenciais = [
  { num: '9h', label: 'por dia na escola' },
  { num: '200', label: 'dias letivos' },
  { num: '3', label: 'anos de formação' },
  { num: '100%', label: 'público e gratuito' },
]

const areas = [
  { Icon: PenLine, nome: 'Linguagens', materias: ['Língua Portuguesa', 'Literatura', 'Inglês', 'Arte', 'Educação Física'] },
  { Icon: FlaskConical, nome: 'Ciências da Natureza', materias: ['Biologia', 'Química', 'Física'] },
  { Icon: Calculator, nome: 'Matemática', materias: ['Matemática', 'Estatística', 'Probabilidade'] },
  { Icon: Globe, nome: 'Ciências Humanas', materias: ['História', 'Geografia', 'Filosofia', 'Sociologia'] },
]

const itModulos = [
  { Icon: Code, titulo: 'Desenvolvimento Web', desc: 'HTML, CSS, JavaScript, frameworks modernos e publicação de projetos.' },
  { Icon: Network, titulo: 'Redes & Infraestrutura', desc: 'Fundamentos de redes, TCP/IP, cabeamento e administração de sistemas.' },
  { Icon: Cpu, titulo: 'Robótica & Automação', desc: 'Arduino, sensores, atuadores e programação de sistemas embarcados.' },
  { Icon: Monitor, titulo: 'Manutenção de Computadores', desc: 'Hardware, sistemas operacionais, diagnóstico e suporte técnico.' },
]

export default function EmtiPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <Image src="/fachada.jpg" alt="E.E. Dr. João Beraldo" fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,58,92,0.97) 0%, rgba(26,58,92,0.65) 55%, transparent 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 mb-2">
            Programa educacional
          </p>
          <div className="w-10 h-px bg-escola-vermelho mb-5" />
          <h1 className="font-playfair text-white font-black text-3xl md:text-5xl lg:text-6xl leading-tight mb-4">
            Ensino Médio<br />em Tempo Integral
          </h1>
          <p className="font-serif text-white/80 text-base md:text-lg leading-relaxed max-w-xl">
            9 horas diárias de formação integral: currículo nacional, formação técnica em TI
            e desenvolvimento de habilidades para o futuro.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/contato" className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center gap-2">
              Saiba sobre matrículas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Diferenciais */}
      <div className="bg-escola-vermelho text-white border-b-2 border-escola-azul">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {diferenciais.map((d, i) => (
              <div key={d.num} className={`px-5 py-6 text-center ${i > 0 ? 'border-l border-white/15' : ''}`}>
                <div className="font-playfair font-black text-3xl md:text-4xl leading-none mb-1">{d.num}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/65">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* O que é + Horário */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <AnimateOnScroll>
              <p className="section-label mb-2">O modelo</p>
              <div className="w-10 h-px bg-escola-vermelho mb-5" />
              <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-6">
                O que é o EMTI?
              </h2>
              <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base">
                <p>
                  O <strong>Ensino Médio em Tempo Integral (EMTI)</strong> é um modelo educacional que amplia
                  a jornada escolar para <strong>9 horas diárias</strong>, integrando o currículo nacional com
                  formação técnica e desenvolvimento pessoal.
                </p>
                <p>
                  Na E.E. Dr. João Beraldo, o EMTI foi implantado em <strong>2020</strong>, com ênfase em
                  <strong> Tecnologia da Informação</strong>. Os alunos saem do Ensino Médio com formação
                  técnica reconhecida e prontos para o mercado de trabalho ou o ensino superior.
                </p>
                <p>
                  Além do currículo da BNCC, o programa inclui <strong>Eletivas</strong>, <strong>Projeto de Vida</strong>,
                  <strong> Tutoria</strong> e <strong>Protagonismo Juvenil</strong> — componentes que desenvolvem
                  autonomia, pensamento crítico e habilidades socioemocionais.
                </p>
                <p className="text-sm text-escola-cinza border-l-4 border-escola-azul/20 pl-4">
                  Todas as refeições são incluídas. Transporte escolar disponível para alunos da zona rural.
                  Programa totalmente gratuito — escola pública estadual.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <aside className="md:col-span-2">
            <AnimateOnScroll delay={1}>
              <div className="bg-escola-azul text-white p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-escola-vermelho" />
                  <h3 className="font-mono text-xs uppercase tracking-widest text-white/60">Horário do EMTI</h3>
                </div>
                <div className="space-y-3">
                  {horario.map((h, i) => (
                    <div key={h.periodo} className={`pb-3 ${i < horario.length - 1 ? 'border-b border-white/10' : ''}`}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">{h.periodo}</span>
                        <span className="font-playfair font-bold text-escola-vermelho text-sm">{h.horario}</span>
                      </div>
                      <p className="font-serif text-white/65 text-xs leading-relaxed">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-escola-cinza-claro p-4 bg-white">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-azul mb-2">
                  Informações
                </p>
                <p className="font-serif text-escola-cinza text-xs leading-relaxed">
                  Merenda escolar inclusa. Transporte fornecido para alunos da zona rural mediante cadastro.
                  Matrículas conforme calendário da SEE-MG.
                </p>
              </div>
            </AnimateOnScroll>
          </aside>
        </div>
      </section>

      {/* TI Modules */}
      <section className="bg-escola-azul py-14 border-t-2 border-escola-vermelho">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-2">
              Formação técnica integrada
            </p>
            <div className="w-10 h-px bg-escola-vermelho mb-5" />
            <h2 className="font-playfair text-white font-black text-3xl md:text-4xl mb-10">
              Tecnologia da Informação
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {itModulos.map((m, i) => (
              <AnimateOnScroll key={m.titulo} delay={(i % 4) as 0|1|2|3}>
                <div className="bg-escola-azul p-6 hover:bg-escola-azul-medio transition-colors group">
                  <div className="w-9 h-9 border border-escola-vermelho/60 flex items-center justify-center mb-4 group-hover:border-escola-vermelho transition-colors">
                    <m.Icon className="w-4 h-4 text-escola-vermelho" />
                  </div>
                  <h3 className="font-playfair font-bold text-white text-sm mb-2">{m.titulo}</h3>
                  <p className="font-serif text-white/50 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="bg-escola-creme-escuro border-t border-escola-cinza-claro py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <p className="section-label mb-2">Componentes pedagógicos</p>
            <div className="w-10 h-px bg-escola-vermelho mb-5" />
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
              Os 4 Pilares do EMTI
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pilares.map((pilar, i) => (
              <AnimateOnScroll key={pilar.titulo} delay={(i % 2 + 1) as 1|2}>
                <Link href={pilar.href} className="group bg-white border border-escola-cinza-claro border-t-2 border-t-escola-azul p-6 flex flex-col card-lift block">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 bg-escola-azul flex items-center justify-center group-hover:bg-escola-vermelho transition-colors">
                      <pilar.Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-escola-cinza text-right max-w-[140px] leading-relaxed">
                      {pilar.subtitulo}
                    </span>
                  </div>
                  <h3 className="font-playfair font-bold text-escola-azul text-lg mb-2 group-hover:text-escola-vermelho transition-colors">
                    {pilar.titulo}
                  </h3>
                  <p className="font-serif text-escola-cinza text-sm leading-relaxed flex-1">
                    {pilar.desc}
                  </p>
                  {pilar.href !== '/emti' && (
                    <span className="font-mono text-xs text-escola-vermelho mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Saiba mais <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <AnimateOnScroll>
          <p className="section-label mb-2">Currículo base — BNCC</p>
          <div className="w-10 h-px bg-escola-vermelho mb-5" />
          <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
            Áreas do Conhecimento
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-escola-cinza-claro border border-escola-cinza-claro">
          {areas.map((area, i) => (
            <AnimateOnScroll key={area.nome} delay={(i % 4) as 0|1|2|3}>
              <div className="bg-white p-5 hover:bg-escola-creme transition-colors">
                <div className="w-8 h-8 bg-escola-azul/10 flex items-center justify-center mb-4">
                  <area.Icon className="w-4 h-4 text-escola-azul" />
                </div>
                <h3 className="font-playfair font-bold text-escola-azul text-sm mb-3">{area.nome}</h3>
                <ul className="space-y-1.5">
                  {area.materias.map((m) => (
                    <li key={m} className="font-serif text-escola-cinza text-xs flex items-start gap-2">
                      <span className="text-escola-vermelho mt-0.5 flex-shrink-0">—</span>
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
      <section className="bg-escola-azul py-14 border-t-2 border-escola-vermelho">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <AnimateOnScroll>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">
              Matrículas
            </p>
            <h2 className="font-playfair text-white font-black text-2xl md:text-3xl mb-4">
              Quer estudar na João Beraldo?
            </h2>
            <p className="font-serif text-white/65 mb-8 leading-relaxed">
              Entre em contato para saber sobre vagas, documentação necessária e calendário de matrículas do EMTI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contato" className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center justify-center gap-2">
                Fale Conosco <ChevronRight className="w-3 h-3" />
              </Link>
              <a href="https://wa.me/5533998701618" target="_blank" rel="noopener noreferrer"
                className="border border-white/20 text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-white/10 transition-colors">
                WhatsApp
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
