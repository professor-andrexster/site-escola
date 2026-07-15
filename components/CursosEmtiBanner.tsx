import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, Code2, Rocket } from 'lucide-react'

export default function CursosEmtiBanner() {
  return (
    <section className="relative bg-escola-azul overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[60px] border-white/5" />
      <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full border-[50px] border-escola-vermelho/10" />

      <div className="container mx-auto px-4 py-14 md:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-3">
              EMTI · Ensino Médio em Tempo Integral
            </p>
            <div className="w-10 h-px bg-escola-vermelho mb-5" />
            <h2 className="font-playfair text-white font-black text-3xl md:text-4xl lg:text-5xl leading-tight mb-5 text-balance">
              Cursos técnicos e formação integral para o seu futuro
            </h2>
            <p className="font-serif text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              Além da grade regular, o EMTI oferece cursos de Informática, do 1º ao 3º ano: lógica de
              programação, desenvolvimento web, redes, hardware e muito mais, feitos pelos próprios
              professores da escola e disponíveis para você estudar no seu ritmo.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-9 max-w-lg">
              <div>
                <GraduationCap className="w-6 h-6 text-escola-vermelho mb-2" />
                <p className="font-playfair text-white font-bold text-xl leading-none">16</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-1">Cursos</p>
              </div>
              <div>
                <Code2 className="w-6 h-6 text-escola-vermelho mb-2" />
                <p className="font-playfair text-white font-bold text-xl leading-none">100%</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-1">Prático</p>
              </div>
              <div>
                <Rocket className="w-6 h-6 text-escola-vermelho mb-2" />
                <p className="font-playfair text-white font-bold text-xl leading-none">3 anos</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-1">de trilha</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/cursos"
                className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-escola-vermelho-escuro transition-colors text-center"
              >
                Ver os Cursos
              </Link>
              <Link
                href="/emti"
                className="bg-white/10 border border-white/25 text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-white/20 transition-colors text-center"
              >
                Conheça o EMTI
              </Link>
            </div>
          </div>

          {/* Imagem/cartão */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image src="/fachada.jpg" alt="Alunos do EMTI da E.E. Dr. João Beraldo" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 img-overlay-blue" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-xl px-5 py-4 shadow-lg">
                  <div className="w-11 h-11 rounded-full bg-escola-azul flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-playfair font-bold text-escola-azul text-sm leading-tight">Trilha completa de Informática</p>
                    <p className="font-serif text-escola-cinza text-xs">Do 1º ao 3º ano do EMTI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
