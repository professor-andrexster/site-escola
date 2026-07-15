import Link from 'next/link'
import Image from 'next/image'

export default function HeroCursosSEO() {
  return (
    <div className="bg-escola-azul text-white relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[60px] border-white/5" />
      <div className="container mx-auto px-4 py-16 max-w-5xl relative">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white ring-4 ring-white/10 shadow-xl">
              <Image src="/logo.jpg" alt="E.E. Dr. João Beraldo" width={80} height={80} className="w-full h-full object-cover" priority />
            </div>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 mb-3">E.E. Dr. João Beraldo · EMTI</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-black mb-4">
            Cursos Profissionalizantes do Ensino Médio Integral
          </h1>
          <p className="text-xl text-white/80 mb-6 max-w-3xl mx-auto">
            Trilhas de aprendizagem desenvolvidas pelos professores da escola para formar protagonistas
            preparados para o mercado de trabalho e a educação superior.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="#cursos"
              className="px-6 py-3 bg-white text-escola-azul font-bold rounded-lg hover:bg-white/90 transition-colors"
            >
              Ver Cursos
            </Link>
            <Link
              href="/admin/cadastro"
              className="px-6 py-3 border-2 border-escola-vermelho bg-escola-vermelho text-white font-bold rounded-lg hover:bg-escola-vermelho/90 transition-colors"
            >
              Me Inscrever
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t border-white/10 pt-10">
          <div>
            <div className="text-3xl font-playfair font-bold mb-2">Informática</div>
            <p className="text-white/70 text-sm">Cursos alinhados com a grade do EMTI</p>
          </div>
          <div>
            <div className="text-3xl font-playfair font-bold mb-2">Professores</div>
            <p className="text-white/70 text-sm">Feitos pela equipe da própria escola</p>
          </div>
          <div>
            <div className="text-3xl font-playfair font-bold mb-2">Prático</div>
            <p className="text-white/70 text-sm">Aprendizado com exemplos do dia a dia</p>
          </div>
        </div>
      </div>
    </div>
  )
}
