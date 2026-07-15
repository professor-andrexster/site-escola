import Link from 'next/link'

export default function HeroCursosSEO() {
  return (
    <div className="bg-gradient-to-br from-curso-azul to-curso-azul/80 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Main Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cursos Profissionalizantes do Ensino Médio Integral
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
            Trilhas de aprendizagem desenvolvidas por professores experientes para formar protagonistas
            preparados para o mercado de trabalho e educação superior.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="#cursos"
              className="px-6 py-3 bg-white text-curso-azul font-bold rounded-lg hover:bg-white/90 transition-colors"
            >
              Ver Cursos
            </Link>
            <Link
              href="/admin/cadastro"
              className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              Me Inscrever
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">Informática</div>
            <p className="text-white/80">Cursos alinhados com EMTI</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">Professores</div>
            <p className="text-white/80">Experientes e atualizados</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">Prático</div>
            <p className="text-white/80">Aprendizado hands-on</p>
          </div>
        </div>
      </div>
    </div>
  )
}
