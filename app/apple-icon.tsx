import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a3a5c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '36px',
        }}
      >
        {/* Faixa vermelha no topo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '16px',
            background: '#c0392b',
          }}
        />

        {/* Letras JB */}
        <div
          style={{
            color: 'white',
            fontSize: '80px',
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginTop: '8px',
          }}
        >
          JB
        </div>

        {/* Faixa vermelha no fundo */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: '#c0392b',
            opacity: 0.5,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
