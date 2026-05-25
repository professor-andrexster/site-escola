import PageLayout from '@/components/PageLayout'
import ContatoForm from '@/components/ContatoForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato — E.E. Dr. João Beraldo',
  description: 'Entre em contato com a E.E. Dr. João Beraldo. Atendemos de segunda a sexta, das 7h às 22h.',
}

export default function ContatoPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-fraunces text-4xl font-bold text-gray-900 mb-4">Contato</h1>
        <p className="text-gray-600 mb-10">
          Preencha o formulário abaixo ou fale diretamente pelo WhatsApp. Atendemos de segunda a sexta, das 7h às 22h.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <ContatoForm />

          <div className="space-y-5">
            <h2 className="font-fraunces text-lg font-bold text-gray-900">Informações</h2>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-700 mb-0.5">Endereço</dt>
                <dd className="text-gray-600">Av. Gabriel Passos, 393 — Centro<br />Carlos Chagas — MG, CEP 39864-000</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700 mb-0.5">Telefone / WhatsApp</dt>
                <dd className="text-gray-600">(33) 99870-1618</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700 mb-0.5">E-mail</dt>
                <dd>
                  <a href="mailto:escola.146579.secretaria@educacao.mg.gov.br" className="text-escola-azul hover:underline break-all">
                    escola.146579.secretaria@educacao.mg.gov.br
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700 mb-0.5">Horário</dt>
                <dd className="text-gray-600">Segunda a sexta: 7h às 22h</dd>
              </div>
            </dl>

            <a
              href="https://wa.me/5533998701618"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </a>

            <div className="pt-2">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Redes Sociais</h3>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/escolajoaoberaldo" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-escola-azul transition-colors text-sm">Instagram</a>
                <a href="https://youtube.com/@joaoberaldocarloschagas" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-escola-azul transition-colors text-sm">YouTube</a>
                <a href="https://www.facebook.com/share/1GrYbrPEvJ/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-escola-azul transition-colors text-sm">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
