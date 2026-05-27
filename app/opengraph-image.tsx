import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'E.E. Dr. João Beraldo — Carlos Chagas, MG'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a3a5c',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'Georgia, serif',
          overflow: 'hidden',
        }}
      >
        {/* Faixa vermelha esquerda */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '8px',
            background: '#c0392b',
          }}
        />

        {/* Faixa vermelha topo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#c0392b',
          }}
        />

        {/* Padrão decorativo fundo */}
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-40px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '60px solid rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            border: '60px solid rgba(255,255,255,0.03)',
          }}
        />

        {/* Conteúdo principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 80px',
            flex: 1,
          }}
        >
          {/* Label superior */}
          <div
            style={{
              color: '#c0392b',
              fontSize: '18px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              marginBottom: '24px',
            }}
          >
            ESCOLA ESTADUAL · CARLOS CHAGAS, MG
          </div>

          {/* Linha separadora */}
          <div
            style={{
              width: '60px',
              height: '3px',
              background: '#c0392b',
              marginBottom: '32px',
            }}
          />

          {/* Nome da escola */}
          <div
            style={{
              color: 'white',
              fontSize: '84px',
              fontWeight: 'bold',
              lineHeight: 1.05,
              marginBottom: '32px',
              letterSpacing: '-1px',
            }}
          >
            Dr. João Beraldo
          </div>

          {/* Subtítulo */}
          <div
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '26px',
              lineHeight: 1.5,
              maxWidth: '700px',
            }}
          >
            Ensino Médio em Tempo Integral · EMTI
          </div>

          {/* Rodapé */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Badge JB */}
            <div
              style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '-1px',
              }}
            >
              JB
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', fontWeight: 'bold' }}>
                escolaestadualdrjoaoberaldo.com
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                FUNDADA EM 1946 · INEP 31146579
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
